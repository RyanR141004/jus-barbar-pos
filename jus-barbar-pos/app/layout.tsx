import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { RoleProvider } from '@/components/shared/RoleProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Jus Bar Bar POS',
    template: '%s | Jus Bar Bar POS',
  },
  description: 'Sistem Point of Sale untuk Jus Bar Bar — kelola menu dan laporan penjualan dengan mudah.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="dark">
      <body>
        <ThemeProvider><RoleProvider>{children}</RoleProvider></ThemeProvider>
      </body>
    </html>
  );
}
