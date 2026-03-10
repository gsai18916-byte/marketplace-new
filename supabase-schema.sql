-- ============================================================
-- Luminance Marketplace — Supabase SQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('wallpaper', 'prompt')),
  slug        TEXT NOT NULL UNIQUE,
  thumbnail   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type          TEXT NOT NULL CHECK (type IN ('wallpaper', 'prompt')),
  price_inr     INTEGER NOT NULL,
  price_usd     INTEGER,
  file_path     TEXT,
  thumbnail_url TEXT,
  images        JSONB,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  amount         INTEGER NOT NULL,
  currency       TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
  payment_id     TEXT,
  customer_email TEXT NOT NULL,
  customer_name  TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Download tokens
CREATE TABLE IF NOT EXISTS download_tokens (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  token               TEXT NOT NULL UNIQUE,
  remaining_downloads INTEGER NOT NULL DEFAULT 5,
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_downloaded     TIMESTAMPTZ
);

-- Download logs
CREATE TABLE IF NOT EXISTS download_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id      UUID NOT NULL REFERENCES download_tokens(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address    TEXT
);

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  is_admin   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_token_id ON download_logs(token_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Products: public read (active only), admin all
CREATE POLICY "Public can read active products"
  ON products FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Orders: no public access, admin all
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Download tokens: no public access (accessed via service role)
CREATE POLICY "Admins can manage download_tokens"
  ON download_tokens FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Download logs: admin only
CREATE POLICY "Admins can manage download_logs"
  ON download_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Profiles: users see own, admins see all
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STORAGE BUCKET
-- Run this separately in the Supabase Dashboard > Storage
-- or via the API. Supabase SQL editor doesn't support
-- storage bucket creation directly.
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('products', 'products', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- To create your first admin user:
-- 1. Sign up via Supabase Auth or the app
-- 2. Then run:
-- UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
-- ============================================================
