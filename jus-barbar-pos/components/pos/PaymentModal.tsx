'use client';

import { useState } from 'react';
import { X, Banknote, QrCode, CheckCircle, Loader2, Printer } from 'lucide-react';
import Image from 'next/image';
import { formatRupiah } from '@/lib/utils';
import { printReceipt } from '@/lib/bluetooth-printer';
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
  const [printing, setPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState('');

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

  const handlePrint = async () => {
    if (!method) return;
    setPrinting(true);
    setPrintMessage('');

    const result = await printReceipt({
      customerName,
      items: cartItems.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity,
        notes: item.notes || '',
      })),
      total,
      paymentMethod: method,
      cashReceived: method === 'CASH' ? Number(cashReceived) : undefined,
      change: method === 'CASH' ? change : undefined,
    });

    setPrintMessage(result.message);
    setPrinting(false);
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
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Pembayaran Berhasil!</h3>
            {method === 'CASH' && change > 0 && (
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Kembalian:{' '}
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatRupiah(change)}</span>
              </p>
            )}
            <p className="text-emerald-400 text-sm mt-1">Transaksi tersimpan</p>

            {/* Print status message */}
            {printMessage && (
              <p className={`text-xs mt-2 ${printMessage.includes('berhasil') ? 'text-emerald-400' : 'text-red-400'}`}>
                {printMessage}
              </p>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePrint}
                disabled={printing}
                className="flex-1 btn-secondary justify-center py-3"
                style={{ border: '1px solid var(--bg-input-border)' }}
              >
                {printing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mencetak...</>
                ) : (
                  <><Printer className="w-4 h-4" /> Cetak Struk</>
                )}
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
                {item.notes && (
                  <p className="pl-2 italic" style={{ fontSize: '10px' }}>* {item.notes}</p>
                )}
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
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--border-main)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Pilih Metode Pembayaran</h3>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Order summary */}
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            {cartItems.map((item) => (
              <div key={item.product.id}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatRupiah(item.product.price * item.quantity)}</span>
                </div>
                {item.notes && (
                  <p className="text-xs italic ml-2 text-orange-400">✏️ {item.notes}</p>
                )}
              </div>
            ))}
            <div
              className="pt-2 flex justify-between font-bold"
              style={{ borderTop: '1px solid var(--border-main)' }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Total</span>
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
                    : ''
                }`}
                style={
                  method !== 'CASH'
                    ? { borderColor: 'var(--bg-input-border)', backgroundColor: 'var(--bg-input)' }
                    : {}
                }
              >
                <Banknote className={`w-6 h-6 ${method === 'CASH' ? 'text-orange-400' : ''}`} style={method !== 'CASH' ? { color: 'var(--text-muted)' } : {}} />
                <span
                  className="font-semibold text-sm"
                  style={{ color: method === 'CASH' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  Tunai
                </span>
              </button>
              <button
                id="btn-pay-qris"
                onClick={() => setMethod('QRIS')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  method === 'QRIS'
                    ? 'border-orange-500 bg-orange-500/10'
                    : ''
                }`}
                style={
                  method !== 'QRIS'
                    ? { borderColor: 'var(--bg-input-border)', backgroundColor: 'var(--bg-input)' }
                    : {}
                }
              >
                <QrCode className={`w-6 h-6 ${method === 'QRIS' ? 'text-orange-400' : ''}`} style={method !== 'QRIS' ? { color: 'var(--text-muted)' } : {}} />
                <span
                  className="font-semibold text-sm"
                  style={{ color: method === 'QRIS' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
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
                      className="py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--bg-input-border)',
                      }}
                    >
                      {formatRupiah(v)}
                    </button>
                  ))}
              </div>

              {cashReceived && Number(cashReceived) >= total && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Kembalian</span>
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
                  src="/barcode-pembayaran.jpeg" 
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
              <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
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
