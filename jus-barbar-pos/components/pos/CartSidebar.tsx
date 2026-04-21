'use client';

import { Plus, Minus, Trash2, ShoppingCart, CreditCard, User } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import type { CartItem } from '@/types/database.types';

interface CartSidebarProps {
  cartItems: CartItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
  isProcessing: boolean;
}

export default function CartSidebar({
  cartItems,
  customerName,
  setCustomerName,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  isProcessing,
}: CartSidebarProps) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-400" />
          <h2 className="font-bold text-white">Keranjang</h2>
          {itemCount > 0 && (
            <span className="ml-auto bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce-in">
              {itemCount}
            </span>
          )}
        </div>
        
        {/* Customer Name Input */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Nama Pembeli (Wajib)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input-field pl-9 py-2 text-sm bg-slate-950"
            required
          />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-slate-400 font-medium text-sm">Keranjang kosong</p>
            <p className="text-slate-600 text-xs mt-1">Pilih produk dari menu</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.product.id}
              className="bg-slate-800 rounded-xl p-3 space-y-2 animate-fade-in"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-orange-400 text-xs font-semibold">
                    {formatRupiah(item.product.price)}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.product.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                  aria-label="Hapus item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    id={`btn-decrease-${item.product.id}`}
                    onClick={() => onDecrease(item.product.id)}
                    className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <span className="text-white font-bold text-sm w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    id={`btn-increase-${item.product.id}`}
                    onClick={() => onIncrease(item.product.id)}
                    className="w-7 h-7 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
                <p className="text-white font-bold text-sm">
                  {formatRupiah(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Total */}
      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium text-sm">Subtotal</span>
          <span className="text-white font-bold text-lg">{formatRupiah(total)}</span>
        </div>

        <button
          id="btn-checkout"
          onClick={onCheckout}
          disabled={cartItems.length === 0 || isProcessing || !customerName.trim()}
          className="w-full btn-primary justify-center py-3.5 glow-orange disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <CreditCard className="w-4 h-4" />
          {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
      </div>
    </div>
  );
}
