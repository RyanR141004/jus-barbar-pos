# Jus Bar Bar POS — README

Aplikasi Point of Sale berbasis web untuk UMKM Jus, dibangun dengan **Next.js 14**, **Tailwind CSS**, dan **Supabase**.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Deployment**: Vercel

## 🚀 Setup & Instalasi

### 1. Install dependencies
```bash
npm install
```

### 2. Setup database Supabase
Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/xagdginvxkwnatymozfs/sql/new) dan jalankan file `supabase/schema.sql`.

### 3. Setup Supabase Storage
- Buka [Storage](https://supabase.com/dashboard/project/xagdginvxkwnatymozfs/storage/buckets)  
- Klik **New Bucket**, nama: `product-images`, centang **Public**

### 4. Konfigurasi environment
Edit file `.env.local` dan isi `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xagdginvxkwnatymozfs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_HERE
```
Dapatkan anon key dari: **Supabase Dashboard → Settings → API → Project API Keys → anon public**

### 5. Buat akun kasir di Supabase Auth
- [Supabase Auth Users](https://supabase.com/dashboard/project/xagdginvxkwnatymozfs/auth/users)  
- Klik **Add user** → masukkan email + password kasir

### 6. Jalankan aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

## 📁 Struktur Project

```
jus-barbar-pos/
├── app/
│   ├── (auth)/login/        → Halaman login
│   ├── (dashboard)/
│   │   ├── page.tsx         → Dashboard ringkasan
│   │   ├── pos/             → Kasir (POS)
│   │   ├── produk/          → Manajemen produk
│   │   └── laporan/         → Laporan penjualan
│   └── api/reports/daily/   → API laporan harian
├── components/
│   ├── pos/                 → ProductCard, CartSidebar, PaymentModal
│   ├── produk/              → ProductForm
│   └── shared/              → Sidebar, Header
├── lib/supabase/            → Client & server Supabase
├── types/                   → TypeScript types
└── supabase/schema.sql      → Database schema lengkap
```

## ✅ Fitur

- 🔐 **Auth**: Login dengan Supabase Auth
- 🛒 **POS**: Grid menu, keranjang, checkout tunai/QRIS
- 📦 **Stok**: Berkurang otomatis via database trigger
- 📊 **Laporan**: Bar chart tren 7/14/30 hari + produk terlaris
- 🗂️ **Manajemen Produk**: Tambah/edit/hapus + upload foto
- 📱 **Responsive**: Dioptimalkan untuk tablet
