import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Jus Bar Bar POS',
    template: '%s | Jus Bar Bar POS',
  },
  description: 'Sistem Point of Sale untuk Jus Bar Bar — kelola menu, stok, dan laporan penjualan dengan mudah.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
