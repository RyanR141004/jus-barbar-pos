'use client';

import { useState } from 'react';
import { X, Banknote, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatRupiah } from '@/lib/utils';
import type { CartItem } from '@/types/database.types';

interface PaymentModalProps {
  cartItems: CartItem[];
  customerName: string;
  total: number;
  onConfirm: (method: 'CASH' | 'QRIS') => Promise<void>;
  onClose: () => void;
}

export default function PaymentModal({
  cartItems,
  customerName,
  total,
  onConfirm,
  onClose,
}: PaymentModalProps) {
  const [method, setMethod] = useState<'CASH' | 'QRIS' | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const change = method === 'CASH' ? Number(cashReceived) - total : 0;
  const cashValid =
    method !== 'CASH' || (Number(cashReceived) >= total && cashReceived !== '');

  const handleConfirm = async () => {
    if (!method || !cashValid) return;
    setProcessing(true);
    await onConfirm(method);
    setSuccess(true);
    setProcessing(false);
  };


  if (success) {
    return (
      <>
        {/* Modal Layar Sukses */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:hidden">
          <div className="card-glass p-8 max-w-sm w-full text-center animate-bounce-in">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Pembayaran Berhasil!</h3>
            {method === 'CASH' && change > 0 && (
              <p className="text-slate-400 mt-2 text-sm">
                Kembalian:{' '}
                <span className="text-white font-bold">{formatRupiah(change)}</span>
              </p>
            )}
            <p className="text-emerald-400 text-sm mt-1">Transaksi tersimpan</p>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 btn-secondary justify-center py-3 border border-slate-600 hover:border-slate-500"
              >
                🖨️ Cetak Struk
              </button>
              <button
                id="btn-close-success"
                onClick={onClose}
                className="flex-1 btn-primary justify-center py-3"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>

        {/* Layout Struk (Print Version) */}
        <div id="printable-receipt-container" className="hidden print:block text-black bg-white p-2 text-xs font-mono">
          <div className="text-center mb-4">
            <h2 className="font-bold text-base">JUS BAR BAR</h2>
            <p>Sistem Point of Sale</p>
            <p>================================</p>
          </div>
          <div className="mb-2 uppercase">
            <p>Tgl: {new Date().toLocaleString('id-ID')}</p>
            <p>Plg: {customerName}</p>
          </div>
          <p>--------------------------------</p>
          <div className="space-y-1 my-2">
            {cartItems.map((item, i) => (
              <div key={i}>
                <p className="uppercase">{item.product.name}</p>
                <div className="flex justify-between pl-2">
                  <span>{item.quantity} x {formatRupiah(item.product.price)}</span>
                  <span>{formatRupiah(item.product.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
          <p>--------------------------------</p>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatRupiah(total)}</span>
          </div>
          <div className="flex justify-between">
            <span>BAYAR ({method})</span>
            <span>{method === 'CASH' ? formatRupiah(Number(cashReceived)) : formatRupiah(total)}</span>
          </div>
          {method === 'CASH' && (
            <div className="flex justify-between">
              <span>KEMBALI</span>
              <span>{formatRupiah(change)}</span>
            </div>
          )}
          <p className="mt-2">================================</p>
          <div className="text-center mt-4 uppercase">
            <p>Terima Kasih Telah Berbelanja</p>
            <p>Semoga Harimu Menyenangkan!</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card-glass max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="font-bold text-white text-lg">Pilih Metode Pembayaran</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Order summary */}
          <div className="bg-slate-800/60 rounded-xl p-4 space-y-2">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-slate-400">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="text-white">{formatRupiah(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold">
              <span className="text-slate-300">Total</span>
              <span className="text-orange-400 text-lg">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Method selection */}
          <div>
            <p className="label">Metode Pembayaran</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-pay-cash"
                onClick={() => setMethod('CASH')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  method === 'CASH'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <Banknote className={`w-6 h-6 ${method === 'CASH' ? 'text-orange-400' : 'text-slate-400'}`} />
                <span className={`font-semibold text-sm ${method === 'CASH' ? 'text-white' : 'text-slate-300'}`}>
                  Tunai
                </span>
              </button>
              <button
                id="btn-pay-qris"
                onClick={() => setMethod('QRIS')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  method === 'QRIS'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <QrCode className={`w-6 h-6 ${method === 'QRIS' ? 'text-orange-400' : 'text-slate-400'}`} />
                <span className={`font-semibold text-sm ${method === 'QRIS' ? 'text-white' : 'text-slate-300'}`}>
                  QRIS
                </span>
              </button>
            </div>
          </div>

          {/* Cash input */}
          {method === 'CASH' && (
            <div className="animate-fade-in space-y-3">
              <div>
                <label className="label">Uang Diterima</label>
                <input
                  id="input-cash-received"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  className="input-field text-lg font-bold"
                  min={total}
                  autoFocus
                />
              </div>

              {/* Quick cash buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[total, 10000 * Math.ceil(total / 10000), 50000, 100000]
                  .filter((v) => v >= total)
                  .map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setCashReceived(String(v))}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-200 transition-colors border border-slate-700 hover:border-slate-600"
                    >
                      {formatRupiah(v)}
                    </button>
                  ))}
              </div>

              {cashReceived && Number(cashReceived) >= total && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between">
                  <span className="text-slate-400 text-sm">Kembalian</span>
                  <span className="text-emerald-400 font-bold">{formatRupiah(change)}</span>
                </div>
              )}

              {cashReceived && Number(cashReceived) < total && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center">
                    Uang kurang {formatRupiah(total - Number(cashReceived))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QRIS placeholder / Real QRIS */}
          {method === 'QRIS' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 relative overflow-hidden">
                <Image 
                  src="/qris.jpg" 
                  alt="QRIS Jus Bar Bar" 
                  width={200} 
                  height={200} 
                  className="rounded-lg shadow-sm"
                />
                <p className="text-slate-600 text-xs text-center font-medium mt-2">
                  Scan QR Code ini untuk membayar
                </p>
                <p className="text-slate-800 font-bold text-lg">{formatRupiah(total)}</p>
              </div>
              <p className="text-slate-500 text-xs text-center mt-2">
                Klik &quot;Selesai Bayar&quot; setelah pembayaran dikonfirmasi
              </p>
            </div>
          )}

          {/* Confirm button */}
          <button
            id="btn-confirm-payment"
            onClick={handleConfirm}
            disabled={!method || !cashValid || processing}
            className="w-full btn-primary justify-center py-3.5 glow-orange disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              '✓ Selesai Bayar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
