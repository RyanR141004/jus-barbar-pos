'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/pos/ProductCard';
import CartSidebar from '@/components/pos/CartSidebar';
import PaymentModal from '@/components/pos/PaymentModal';
import { Search, ShoppingCart, X } from 'lucide-react';
import type { Product, CartItem, Category } from '@/types/database.types';

export default function POSPage() {
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');

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

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === null || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const increaseQty = (productId: number) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decreaseQty = (productId: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (!item) return prev;
      if (item.quantity === 1) return prev.filter((i) => i.product.id !== productId);
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handlePaymentConfirm = async (method: 'CASH' | 'QRIS') => {
    setIsProcessing(true);

    const { data: transaction, error: trxError } = await supabase
      .from('transactions')
      .insert({ total_price: total, payment_method: method, customer_name: customerName })
      .select()
      .single();

    if (trxError || !transaction) {
      alert('Gagal membuat transaksi. Coba lagi.');
      setIsProcessing(false);
      return;
    }

    const transactionItems = cartItems.map((item) => ({
      transaction_id: transaction.id,
      product_id: item.product.id,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) {
      alert('Gagal menyimpan item transaksi.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    clearCart();
    setCustomerName('');
    fetchData();
    setShowCart(false);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 space-y-3" style={{ borderBottom: '1px solid var(--border-main)', backgroundColor: 'var(--bg-card)' }}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-product"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="input-field pl-10 pr-4"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              id="filter-all"
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-white'
              } font-semibold transition-all`}
              style={
                selectedCategory !== null
                  ? { backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-secondary)' }
                  : {}
              }
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`filter-cat-${cat.id}`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id
                  )
                }
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : ''
                }`}
                style={
                  selectedCategory !== cat.id
                    ? { backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-secondary)' }
                    : {}
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="card h-52 animate-pulse"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <span className="text-5xl mb-3">🔍</span>
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Produk tidak ditemukan</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart Sidebar (Desktop) */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 flex-shrink-0">
        <div className="w-full">
          <CartSidebar
            cartItems={cartItems}
            customerName={customerName}
            setCustomerName={setCustomerName}
            onIncrease={increaseQty}
            onDecrease={decreaseQty}
            onRemove={removeFromCart}
            onCheckout={() => setShowPaymentModal(true)}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Mobile: Floating Cart Button */}
      {cartCount > 0 && !showCart && (
        <button
          id="btn-open-cart"
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 lg:hidden z-30 btn-primary py-3.5 px-5 shadow-xl shadow-orange-500/30 glow-orange rounded-2xl"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold">Keranjang ({cartCount})</span>
        </button>
      )}

      {/* Mobile: Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 sm:w-96 animate-slide-in">
            <CartSidebar
              cartItems={cartItems}
              customerName={customerName}
              setCustomerName={setCustomerName}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
              onRemove={removeFromCart}
              onCheckout={() => {
                setShowCart(false);
                setShowPaymentModal(true);
              }}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          cartItems={cartItems}
          customerName={customerName}
          total={total}
          onConfirm={handlePaymentConfirm}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
}
