'use client';

import { useState, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import type { Product, Category } from '@/types/database.types';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function ProductForm({
  product,
  categories,
  onSuccess,
  onClose,
}: ProductFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [stock, setStock] = useState(String(product?.stock ?? ''));
  const [categoryId, setCategoryId] = useState(String(product?.category_id ?? ''));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let imageUrl = product?.image_url ?? null;

    // Upload image if new one selected
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) {
        setError('Gagal upload gambar. Pastikan bucket "product-images" sudah dibuat di Supabase Storage.');
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrlData.publicUrl;
    }

    const payload = {
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      category_id: categoryId ? Number(categoryId) : null,
      image_url: imageUrl,
    };

    if (isEditing && product) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id);

      if (error) {
        setError('Gagal memperbarui produk.');
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) {
        setError('Gagal menambahkan produk.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card-glass max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="font-bold text-white text-lg">
            {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image upload */}
          <div>
            <label className="label">Foto Produk</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-40 bg-slate-800 border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-xl cursor-pointer transition-colors overflow-hidden group"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 group-hover:text-orange-400 transition-colors">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm font-medium">Klik untuk upload foto</p>
                  <p className="text-xs text-slate-600">JPG, PNG, WebP</p>
                </div>
              )}
              {imagePreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="product-name" className="label">Nama Produk <span className="text-red-400">*</span></label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: Jus Alpukat Susu"
              className="input-field"
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="product-price" className="label">Harga (Rp) <span className="text-red-400">*</span></label>
              <input
                id="product-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15000"
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="product-stock" className="label">Stok Awal <span className="text-red-400">*</span></label>
              <input
                id="product-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="input-field"
                min="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="product-category" className="label">Kategori</label>
            <select
              id="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary justify-center"
            >
              Batal
            </button>
            <button
              id="btn-save-product"
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary justify-center disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : (
                isEditing ? 'Simpan Perubahan' : 'Tambah Produk'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
