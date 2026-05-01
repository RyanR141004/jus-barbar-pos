-- Tambahkan kolom 'notes' ke tabel transaction_items
-- Jalankan di Supabase SQL Editor
ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;
