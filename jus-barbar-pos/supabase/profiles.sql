-- =============================================
-- TABEL PROFILES UNTUK ROLE-BASED ACCESS
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. Buat tabel profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'kasir' CHECK (role IN ('admin', 'kasir')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: user bisa baca profile sendiri
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 4. Policy: semua user yang login bisa baca semua profiles (untuk cek role)
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 5. Trigger: otomatis buat profile saat user baru register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (NEW.id, 'kasir', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Buat trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Set user yang sudah ada sebagai admin (ganti email sesuai akun owner)
INSERT INTO profiles (id, role, full_name)
SELECT id, 'admin', 'Bos Opin'
FROM auth.users
WHERE email = 'kasirjusbarbar@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Bos Opin';
