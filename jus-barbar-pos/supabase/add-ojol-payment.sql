-- Tambahkan opsi 'OJOL' ke kolom payment_method di tabel transactions
-- Jalankan di Supabase SQL Editor

-- Jika payment_method menggunakan CHECK constraint, jalankan ini:
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_payment_method_check 
  CHECK (payment_method IN ('CASH', 'QRIS', 'OJOL'));

-- Jika payment_method adalah kolom TEXT biasa tanpa constraint, 
-- query di atas cukup. Tidak ada perubahan lain yang diperlukan.
