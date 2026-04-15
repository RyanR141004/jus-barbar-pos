'use client';

import Image from 'next/image';
import { Plus, AlertTriangle } from 'lucide-react';
import { formatRupiah, getStockStatus } from '@/lib/utils';
import type { Product } from '@/types/database.types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const stockStatus = getStockStatus(product.stock);
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className={`card product-card-hover overflow-hidden cursor-pointer group ${
        isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={() => !isOutOfStock && onAdd(product)}
    >
      {/* Image */}
      <div className="relative h-36 bg-slate-800 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/10 to-slate-800">
            <span className="text-4xl">🥤</span>
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-2 right-2">
          {isOutOfStock ? (
            <span className="badge-danger text-[10px] px-2 py-0.5">Habis</span>
          ) : stockStatus === 'critical' ? (
            <span className="badge-danger text-[10px] px-2 py-0.5 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" />
              Sisa {product.stock}
            </span>
          ) : stockStatus === 'low' ? (
            <span className="badge-warning text-[10px] px-2 py-0.5">
              Sisa {product.stock}
            </span>
          ) : null}
        </div>

        {/* Add overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-200 flex items-center justify-center">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200 shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-white text-sm leading-tight line-clamp-1">
          {product.name}
        </p>
        {product.categories && (
          <p className="text-slate-500 text-xs mt-0.5">{product.categories.name}</p>
        )}
        <p className="text-orange-400 font-bold text-sm mt-1.5">
          {formatRupiah(product.price)}
        </p>
      </div>
    </div>
  );
}
