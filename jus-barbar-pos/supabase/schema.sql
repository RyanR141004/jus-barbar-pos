-- ============================================================
-- JUS BAR BAR POS - Database Schema
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabel Kategori
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Produk (Jus & Es)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  stock INT DEFAULT 0,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Transaksi
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_price INT NOT NULL,
  payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'QRIS')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Item Transaksi
CREATE TABLE IF NOT EXISTS transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  subtotal INT NOT NULL
);

-- ============================================================
-- TRIGGER: Kurangi stok otomatis saat item transaksi ditambah
-- ============================================================
CREATE OR REPLACE FUNCTION reduce_stock_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reduce_stock ON transaction_items;
CREATE TRIGGER trigger_reduce_stock
AFTER INSERT ON transaction_items
FOR EACH ROW
EXECUTE FUNCTION reduce_stock_on_transaction();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write everything
CREATE POLICY "auth_all_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_transaction_items" ON transaction_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA: Kategori & Produk Contoh
-- ============================================================
INSERT INTO categories (name) VALUES
  ('Jus Buah'),
  ('Es Segar'),
  ('Minuman Susu')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, price, stock, category_id) VALUES
  ('Jus Alpukat Susu',     18000, 50, (SELECT id FROM categories WHERE name = 'Jus Buah')),
  ('Jus Mangga Segar',     15000, 40, (SELECT id FROM categories WHERE name = 'Jus Buah')),
  ('Jus Jambu Merah',      15000, 35, (SELECT id FROM categories WHERE name = 'Jus Buah')),
  ('Jus Sirsak',           16000, 30, (SELECT id FROM categories WHERE name = 'Jus Buah')),
  ('Jus Jeruk Peras',      14000, 45, (SELECT id FROM categories WHERE name = 'Jus Buah')),
  ('Jus Semangka',         14000, 50, (SELECT id FROM categories WHERE name = 'Jus Buah')),
  ('Es Kelapa Muda',       12000, 60, (SELECT id FROM categories WHERE name = 'Es Segar')),
  ('Es Lemon Tea',         10000, 70, (SELECT id FROM categories WHERE name = 'Es Segar')),
  ('Es Teh Manis',          8000, 80, (SELECT id FROM categories WHERE name = 'Es Segar')),
  ('Es Cincau Hijau',      12000, 40, (SELECT id FROM categories WHERE name = 'Es Segar')),
  ('Susu Coklat Dingin',   15000, 30, (SELECT id FROM categories WHERE name = 'Minuman Susu')),
  ('Susu Strawberry',      15000, 25, (SELECT id FROM categories WHERE name = 'Minuman Susu'))
ON CONFLICT DO NOTHING;

-- ============================================================
-- STORAGE: Buat bucket untuk foto produk (tambahan manual)
-- ============================================================
-- Di Supabase: Storage → New Bucket → Name: "product-images" → Public: ON
-- ============================================================
