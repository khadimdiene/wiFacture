-- ============================================================
-- WiFacture - Script SQL Complet (Copier-Coller dans Supabase)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT DEFAULT 'Entreprise',
  status TEXT DEFAULT 'Actif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  customer TEXT NOT NULL,
  salesman TEXT,
  amount NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoyée', 'payée', 'en retard')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  invoice_number TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PURCHASES
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  item_name TEXT,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'Pièce',
  date DATE DEFAULT CURRENT_DATE,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'en attente' CHECK (status IN ('reçue', 'en attente', 'annulée')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DELIVERIES
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  address TEXT,
  driver TEXT DEFAULT 'Non assigné',
  status TEXT DEFAULT 'en préparation' CHECK (status IN ('en préparation', 'en transit', 'livré')),
  expected_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MANUFACTURING ORDERS
CREATE TABLE IF NOT EXISTS manufacturing_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'planifié' CHECK (status IN ('planifié', 'en cours', 'terminé')),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONSIGNMENTS
CREATE TABLE IF NOT EXISTS consignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'En cours' CHECK (status IN ('En cours', 'Vendu', 'Retourné')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category TEXT,
  price NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  legal_name TEXT DEFAULT 'WiFacture',
  logo_url TEXT,
  ninea TEXT,
  rccm TEXT,
  social_address TEXT,
  email TEXT,
  pro_phone TEXT,
  region TEXT DEFAULT 'Dakar',
  currency TEXT DEFAULT 'XOF',
  invoice_template TEXT DEFAULT 'Standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajout colonnes si table déjà existante
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS rccm TEXT;

-- 9. STORES
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'Gratuit',
  stores_limit INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Actif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Désactiver RLS pour les tests
ALTER TABLE company_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE consignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;

SELECT 'Toutes les tables WiFacture créées avec succès ✅' AS resultat;
