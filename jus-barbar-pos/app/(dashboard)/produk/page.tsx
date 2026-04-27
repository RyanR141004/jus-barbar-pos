'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductForm from '@/components/produk/ProductForm';
import { formatRupiah } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import type { Product, Category } from '@/types/database.types';

export default function ProdukPage() {
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(id, name, created_at)')
        .order('name'),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((prods as Product[]) ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    setDeletingId(id);
    await supabase.from('products').delete().eq('id', id);
    await fetchData();
    setDeletingId(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  const handleFormSuccess = async () => {
    handleFormClose();
    await fetchData();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Manajemen Produk</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{products.length} produk terdaftar</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="btn-secondary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="btn-add-product"
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </div>


      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="search-produk"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="input-field pl-10"
        />
      </div>

      {/* Product Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 text-slate-500 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Belum ada produk</p>
            <p className="text-slate-600 text-sm mt-1">
              Klik &quot;Tambah Produk&quot; untuk mulai
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-main)' }}>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left py-3 px-4 font-medium">Produk</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Kategori</th>
                  <th className="text-right py-3 px-4 font-medium">Harga</th>
                  <th className="text-center py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  return (
                    <tr
                      key={product.id}
                      className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                🥤
                              </div>
                            )}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span style={{ color: 'var(--text-muted)' }}>
                          {product.categories?.name ?? '—'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatRupiah(product.price)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-edit-${product.id}`}
                            onClick={() => {
                              setEditProduct(product);
                              setShowForm(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-${product.id}`}
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingId === product.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          onSuccess={handleFormSuccess}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
