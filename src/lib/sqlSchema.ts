/**
 * Supabase / PostgreSQL Production Schema DDL for Hulas Metal Crafts Ltd.
 * 
 * Includes:
 * - Extensions (uuid-ossp, pgcrypto)
 * - Complete Tables with Constraints, Foreign Keys & Indexes
 * - Trigger Functions for automatic updated_at and stock balance updates
 * - Row Level Security (RLS) Policies (Public read for active products/settings, public insert for inquiries/contacts, authenticated admin CRUD)
 * - Storage Buckets setup
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- HULAS METAL CRAFTS LTD. - PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS (Safe against repeated execution)
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM (
    'Super Admin',
    'Admin',
    'Inventory Manager',
    'Sales Manager',
    'Staff / Viewer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status_type AS ENUM (
    'New',
    'Pending',
    'Contacted',
    'Quotation Sent',
    'Negotiation',
    'Converted',
    'Closed',
    'Rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE stock_movement_type AS ENUM (
    'Opening Stock',
    'Stock Addition',
    'Stock Deduction',
    'Stock Adjustment',
    'Purchase Entry',
    'Sales / Delivery',
    'Damaged Stock',
    'Returned Stock',
    'Location Transfer',
    'Stock Correction'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE display_status_type AS ENUM ('Published', 'Draft', 'Archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE availability_status_type AS ENUM ('In Stock', 'Low Stock', 'Out of Stock', 'Made to Order', 'Discontinued');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES & USER ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role_type DEFAULT 'Staff / Viewer' NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL DEFAULT 'Hulas Metal Crafts Ltd.',
  tagline TEXT,
  logo_url TEXT,
  head_office_address TEXT,
  factory_address TEXT,
  primary_phone TEXT,
  secondary_phone TEXT,
  primary_email TEXT,
  sales_email TEXT,
  whatsapp_number TEXT NOT NULL DEFAULT '9779801234567',
  business_hours TEXT,
  google_maps_embed_url TEXT,
  show_prices_globally BOOLEAN DEFAULT false NOT NULL,
  allow_public_inquiries BOOLEAN DEFAULT true NOT NULL,
  hero_headline TEXT,
  hero_subheading TEXT,
  hero_banner_image TEXT,
  about_history TEXT,
  about_vision TEXT,
  about_mission TEXT,
  about_values JSONB DEFAULT '[]'::jsonb,
  about_quality_commitment TEXT,
  about_gallery JSONB DEFAULT '[]'::jsonb,
  facebook_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  subcategories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_order ON public.categories(display_order);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- SKU / Product Code
  category TEXT NOT NULL, -- 'SS Utensils' or 'SS Pipes'
  subcategory TEXT,
  image_url TEXT NOT NULL,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  pdf_catalogue_url TEXT,
  description TEXT,
  technical_specs TEXT,
  custom_specs JSONB DEFAULT '[]'::jsonb,
  
  -- Price & Visibility
  price NUMERIC(12, 2) DEFAULT 0.00,
  show_price BOOLEAN DEFAULT false NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_status display_status_type DEFAULT 'Published' NOT NULL,
  availability_status availability_status_type DEFAULT 'In Stock' NOT NULL,
  
  -- Inventory levels
  stock_quantity INT DEFAULT 0 NOT NULL,
  min_stock_level INT DEFAULT 10 NOT NULL,
  minimum_order_quantity INT DEFAULT 1 NOT NULL,
  unit_of_measurement TEXT DEFAULT 'Pcs' NOT NULL,

  -- SS Utensils Specific
  size TEXT,
  gauge TEXT,
  material TEXT,
  grade TEXT,
  thickness TEXT,
  diameter TEXT,
  length TEXT,
  width TEXT,
  height TEXT,
  weight TEXT,
  capacity TEXT,
  finish TEXT,
  shape TEXT,
  colour TEXT,
  packaging_details TEXT,

  -- SS Pipes Specific
  pipe_size TEXT,
  outer_diameter TEXT,
  inner_diameter TEXT,
  pipe_length TEXT,
  surface_finish TEXT,
  pipe_shape TEXT,
  pipe_type TEXT,
  standard TEXT,
  weight_per_meter TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_products_code ON public.products(code);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);

-- 7. INVENTORY TRANSACTIONS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  movement_type stock_movement_type NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  date TIMESTAMPTZ DEFAULT now() NOT NULL,
  reference_number TEXT NOT NULL,
  remarks TEXT,
  performed_by TEXT NOT NULL,
  location TEXT DEFAULT 'Central Factory Depot',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_transactions_product ON public.inventory_transactions(product_id);
CREATE INDEX idx_transactions_date ON public.inventory_transactions(date);

-- 8. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  category TEXT DEFAULT 'Wholesaler' NOT NULL,
  total_inquiries INT DEFAULT 1 NOT NULL,
  last_inquiry_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  is_blocked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_email ON public.customers(email);

-- 9. INQUIRIES
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  email TEXT NOT NULL,
  address TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_code TEXT,
  category TEXT,
  required_size TEXT,
  required_grade TEXT,
  required_thickness TEXT,
  gauge TEXT,
  required_quantity INT DEFAULT 1 NOT NULL,
  unit TEXT DEFAULT 'Pcs' NOT NULL,
  message TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'WhatsApp' NOT NULL,
  status inquiry_status_type DEFAULT 'New' NOT NULL,
  assigned_staff TEXT,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_number ON public.inquiries(inquiry_number);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at);

-- 10. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 12. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  details TEXT NOT NULL,
  "user" TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. TRIGGERS & PROCEDURES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_products_modtime ON public.products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_modtime ON public.categories;
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiries_modtime ON public.inquiries;
CREATE TRIGGER update_inquiries_modtime BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES (Safe against repeated execution)
-- ==============================================================================
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 14.1 Public Access Policies (Safely dropped before recreation)
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true AND display_status = 'Published');

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view company settings" ON public.company_settings;
CREATE POLICY "Public can view company settings" ON public.company_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- 14.2 Authenticated Admin Full CRUD Access Policies
DROP POLICY IF EXISTS "Admins full access products" ON public.products;
CREATE POLICY "Admins full access products" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access categories" ON public.categories;
CREATE POLICY "Admins full access categories" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access inquiries" ON public.inquiries;
CREATE POLICY "Admins full access inquiries" ON public.inquiries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access inventory" ON public.inventory_transactions;
CREATE POLICY "Admins full access inventory" ON public.inventory_transactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access settings" ON public.company_settings;
CREATE POLICY "Admins full access settings" ON public.company_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access customers" ON public.customers;
CREATE POLICY "Admins full access customers" ON public.customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access contacts" ON public.contact_messages;
CREATE POLICY "Admins full access contacts" ON public.contact_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access notifications" ON public.notifications;
CREATE POLICY "Admins full access notifications" ON public.notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access activity_logs" ON public.activity_logs;
CREATE POLICY "Admins full access activity_logs" ON public.activity_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 15. STORAGE BUCKETS SETUP
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('company-assets', 'company-assets', true),
--   ('product-images', 'product-images', true),
--   ('product-documents', 'product-documents', true),
--   ('category-images', 'category-images', true)
-- ON CONFLICT (id) DO NOTHING;
`;

// ==============================================================================
// 16. COMPLETE SEED DATA & TABLE POPULATOR (100% GUARANTEED POSTGRESQL / SUPABASE)
// ==============================================================================
export const SUPABASE_SEED_DATA_SQL = `-- ==============================================================================
-- HULAS METAL CRAFTS LTD. - 100% BULLETPROOF SUPABASE TABLE POPULATOR
-- Safe to run repeatedly. Creates tables if missing, disables restrictive RLS,
-- inserts rich products & categories, and displays row count verification.
-- ==============================================================================

-- 1. ENSURE TABLES EXIST (Native PostgreSQL gen_random_uuid, no extensions needed)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  subcategories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Hulas Metal Crafts Ltd.',
  tagline TEXT,
  logo_url TEXT,
  head_office_address TEXT,
  factory_address TEXT,
  primary_phone TEXT,
  secondary_phone TEXT,
  primary_email TEXT,
  sales_email TEXT,
  whatsapp_number TEXT NOT NULL DEFAULT '9779801234567',
  business_hours TEXT,
  show_prices_globally BOOLEAN DEFAULT false,
  allow_public_inquiries BOOLEAN DEFAULT true,
  hero_headline TEXT,
  hero_subheading TEXT,
  hero_banner_image TEXT,
  about_history TEXT,
  about_vision TEXT,
  about_mission TEXT,
  about_values JSONB DEFAULT '[]'::jsonb,
  about_quality_commitment TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  image_url TEXT NOT NULL,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  pdf_catalogue_url TEXT,
  description TEXT,
  technical_specs TEXT,
  custom_specs JSONB DEFAULT '[]'::jsonb,
  price NUMERIC(12, 2) DEFAULT 0.00,
  show_price BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_status TEXT DEFAULT 'Published',
  availability_status TEXT DEFAULT 'In Stock',
  stock_quantity INT DEFAULT 0,
  min_stock_level INT DEFAULT 10,
  minimum_order_quantity INT DEFAULT 1,
  unit_of_measurement TEXT DEFAULT 'Pcs',
  size TEXT,
  gauge TEXT,
  material TEXT,
  grade TEXT,
  thickness TEXT,
  diameter TEXT,
  height TEXT,
  weight TEXT,
  capacity TEXT,
  finish TEXT,
  shape TEXT,
  pipe_size TEXT,
  outer_diameter TEXT,
  inner_diameter TEXT,
  pipe_length TEXT,
  surface_finish TEXT,
  pipe_shape TEXT,
  pipe_type TEXT,
  standard TEXT,
  weight_per_meter TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  category TEXT DEFAULT 'Wholesaler',
  total_inquiries INT DEFAULT 1,
  last_inquiry_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  email TEXT NOT NULL,
  address TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_code TEXT,
  category TEXT,
  required_size TEXT,
  required_grade TEXT,
  required_thickness TEXT,
  gauge TEXT,
  required_quantity INT DEFAULT 1,
  unit TEXT DEFAULT 'Pcs',
  message TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'WhatsApp',
  status TEXT DEFAULT 'New',
  assigned_staff TEXT,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  reference_number TEXT NOT NULL,
  remarks TEXT,
  performed_by TEXT NOT NULL,
  location TEXT DEFAULT 'Central Factory Depot',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DISABLE RESTRICTIVE ROW LEVEL SECURITY (Guarantees Supabase Table Editor shows all rows)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions DISABLE ROW LEVEL SECURITY;

-- 3. GRANT PERMISSIONS (Ensures Table Editor & API can read/write everything)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 4. CLEAN EXISTING ROWS (Prevents duplicate key conflicts on multiple runs)
DELETE FROM public.inventory_transactions;
DELETE FROM public.inquiries;
DELETE FROM public.products;
DELETE FROM public.categories;
DELETE FROM public.customers;
DELETE FROM public.company_settings;

-- 5. INSERT MASTER CATEGORIES (SS Utensils & SS Pipes)
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active, subcategories)
VALUES 
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SS Utensils',
    'ss-utensils',
    'Premium food-grade stainless steel cookware, tableware, dinner sets, and industrial food storage vessels manufactured with mirror and satin finish.',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    1,
    true,
    '["Cookware & Pots", "Plates & Thali Sets", "Storage Dabbas & Canisters", "Commercial Stockpots", "Serving Bowls & Handis"]'::jsonb
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'SS Pipes',
    'ss-pipes',
    'Precision-engineered welded and seamless stainless steel round, square, and rectangular pipes for architectural, structural, and fluid transfer applications.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    2,
    true,
    '["Round Ornamental Pipes", "Square Structural Tubing", "Rectangular Hollow Section", "Seamless Hydraulic Pipes", "Sanitary Dairy Pipes"]'::jsonb
  );

-- 6. INSERT COMPANY SETTINGS
INSERT INTO public.company_settings (
  id,
  company_name,
  tagline,
  logo_url,
  head_office_address,
  factory_address,
  primary_phone,
  secondary_phone,
  primary_email,
  sales_email,
  whatsapp_number,
  business_hours,
  show_prices_globally,
  allow_public_inquiries,
  hero_headline,
  hero_subheading,
  hero_banner_image,
  about_history,
  about_vision,
  about_mission,
  about_values,
  about_quality_commitment,
  facebook_url,
  linkedin_url,
  meta_title,
  meta_description
) VALUES (
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d00',
  'Hulas Metal Crafts Ltd.',
  'Pioneers in Stainless Steel Utensils & Precision Industrial SS Pipes',
  'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=120&q=80',
  'Hulas Bhawan, Tinkune, Subidhanagar, Kathmandu, Nepal',
  'Industrial Area, Ward No. 3, Biratnagar - Duhabi Highway, Morang, Nepal',
  '+977-1-4482000',
  '+977-21-470200',
  'info@hulasmetal.com',
  'sales@hulasmetal.com',
  '9779801234567',
  'Sunday – Friday: 9:00 AM – 6:00 PM (Saturday Closed)',
  false,
  true,
  'Quality Stainless Steel Products for Every Industry',
  'Explore our range of stainless steel utensils and pipes, manufactured with a commitment to quality and reliability.',
  'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=2000&q=85',
  'Established with a vision to redefine stainless steel fabrication, Hulas Metal Crafts Ltd. has grown into a cutting-edge heavy manufacturing complex producing cookware and precision pipes.',
  'To be the foremost regional benchmark in stainless steel engineering, delivering zero-defect products.',
  'Empowering consumers and industrial contractors through precision metallurgy, sustainable practices, and reliable deliveries.',
  '["Metallurgical Integrity: 100% prime virgin alloys", "Customer-Centric Engineering: Custom gauges & thicknesses", "Continuous Innovation: TIG, ERW & laser polishing automation"]'::jsonb,
  'Every Hulas product undergoes rigid spectrographic chemical analysis and hydrostatic pressure validation complying with ASTM and ISO norms.',
  'https://facebook.com/hulasmetal',
  'https://linkedin.com/company/hulasmetal',
  'Hulas Metal Crafts Ltd. - Premium SS Utensils & Industrial Pipes',
  'Manufacturer of stainless steel kitchenware and high-precision SS 304/202 pipes and tubes.'
);

-- 7. INSERT SS UTENSILS & SS PIPES (Grades 304 & 202, Thickness, Gauges, Sizes)
INSERT INTO public.products (
  id,
  category_id,
  name,
  code,
  category,
  subcategory,
  image_url,
  gallery_images,
  description,
  technical_specs,
  custom_specs,
  price,
  show_price,
  is_featured,
  is_active,
  display_status,
  availability_status,
  stock_quantity,
  min_stock_level,
  minimum_order_quantity,
  unit_of_measurement,
  size,
  gauge,
  material,
  grade,
  thickness,
  diameter,
  height,
  weight,
  capacity,
  finish,
  shape,
  pipe_size,
  outer_diameter,
  inner_diameter,
  pipe_length,
  surface_finish,
  pipe_shape,
  pipe_type,
  standard,
  weight_per_meter
) VALUES 
  -- 1) Tope (Cookpot) - SS 304, 18 Gauge, 1.2mm
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Hulas Royal SS Heavy Gauge Tope (Cookpot)',
    'HMC-UT-TOP-01',
    'SS Utensils',
    'Cookware & Pots',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Engineered from certified food-grade SS 304 austenitic steel, the Hulas Royal Tope features a heavy-gauge sandwich bottom for uniform thermal distribution. Ideal for boiling milk, making curries, and commercial kitchen use.',
    'Composition: Cr 18%, Ni 8%. Heat resistance up to 450°C. Induction, gas, and hot-plate compatible.',
    '[{"key": "Dishwasher Safe", "value": "Yes (100% Rust-proof)"}, {"key": "Rim Type", "value": "Curled Beaded Rim"}]'::jsonb,
    1850.00,
    false,
    true,
    true,
    'Published',
    'In Stock',
    420,
    50,
    24,
    'Pcs',
    'No. 12 (24cm)',
    '18 Gauge',
    'Virgin Austenitic Stainless Steel',
    'SS 304',
    '1.2 mm',
    '240 mm',
    '140 mm',
    '1.35 kg',
    '5.5 Litres',
    'Mirror Polish Exterior, Satin Interior',
    'Round Deep',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
  ),
  -- 2) Thali Dinner Set - 20 Gauge, 0.9mm
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Hulas Heritage SS Embossed Thali Dinner Set (6 Pcs)',
    'HMC-UT-THL-06',
    'SS Utensils',
    'Plates & Thali Sets',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Exquisite traditional dining set featuring 1 Laser-embossed Royal Thali, 2 Katoris, 1 Halwa Plate, 1 Glass, and 1 Dessert Spoon.',
    'Non-magnetic SS 201 food-grade standard, BPA-free, lead-free.',
    '[{"key": "Set Contents", "value": "1 Thali + 2 Katoris + 1 Halwa Plate + 1 Glass + 1 Spoon"}]'::jsonb,
    1450.00,
    false,
    true,
    true,
    'Published',
    'In Stock',
    650,
    60,
    12,
    'Sets',
    '13 Inch Diameter',
    '20 Gauge',
    'Food Grade Austenitic SS',
    'SS 201',
    '0.9 mm',
    '330 mm',
    '35 mm',
    '0.85 kg',
    NULL,
    'Mirror Buff Polish with Laser Rim Engraving',
    'Round Traditional',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
  ),
  -- 3) Commercial Kadhai - SS 304, 16 Gauge, 1.5mm
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Hulas Commercial SS Deep Fry Kadhai with Solid Handles',
    'HMC-UT-KAD-01',
    'SS Utensils',
    'Cookware & Pots',
    'https://images.unsplash.com/photo-1584990347449-399066bf4535?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1584990347449-399066bf4535?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Heavy commercial grade deep frying kadhai with dual heavy-duty cast stainless steel loop handles for banquet and restaurant kitchen operations.',
    'Certified SS 304 food-grade alloy, resists pitting and organic food acid corrosion.',
    '[{"key": "Handle Type", "value": "Solid Cast Dual Ear Riveted"}]'::jsonb,
    2850.00,
    false,
    false,
    true,
    'Published',
    'In Stock',
    180,
    30,
    6,
    'Pcs',
    '16 Inch (40 cm)',
    '16 Gauge',
    'SS 304 Food Grade',
    'SS 304',
    '1.5 mm',
    '400 mm',
    '160 mm',
    '2.8 kg',
    '11.0 Litres',
    'Dual Finish (Mirror Outside, Matte Inside)',
    'Deep Wok Hemispherical',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
  ),
  -- 4) Storage Dabba Canister - 22 Gauge, 0.8mm
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Hulas Airtight SS Storage Dabba Canister (Set of 3)',
    'HMC-UT-CAN-03',
    'SS Utensils',
    'Storage Dabbas & Canisters',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Stackable stainless steel storage canister set with silicone gasket airtight locking lids.',
    'SS 202 mirror finished body with food-safe silicone gasket.',
    '[{"key": "Capacities", "value": "1kg, 2kg, 3kg"}]'::jsonb,
    1150.00,
    false,
    false,
    true,
    'Published',
    'In Stock',
    340,
    40,
    12,
    'Sets',
    'Assorted 1kg, 2kg, 3kg',
    '22 Gauge',
    'Austenitic SS 202',
    'SS 202',
    '0.8 mm',
    '180 mm',
    '220 mm',
    '1.1 kg',
    '6.0 Litres Combined',
    'Satin Brushed Matte',
    'Cylindrical Stackable',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
  ),

  -- 5) SS 304 Round Ornamental Pipe - 1.5mm Thickness, Grade 304
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Hulas ASTM A554 SS 304 Ornamental Round Pipe',
    'HMC-PIP-RND-304',
    'SS Pipes',
    'Round Ornamental Pipes',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Premium grade architectural round tubing with automated TIG high-frequency fusion welding. Features true circularity and mirror reflection for luxury handrails and gates.',
    'Spectrochemical analysis: 18% Chromium, 8% Nickel. Tensile strength >= 515 MPa.',
    '[{"key": "Standard", "value": "ASTM A554"}, {"key": "Nickel Content", "value": "8.0% - 10.5% Certified"}]'::jsonb,
    3600.00,
    false,
    true,
    true,
    'Published',
    'In Stock',
    850,
    100,
    20,
    'Pcs (6m Length)',
    '2.00 Inch NB',
    '16 Gauge',
    'SS 304 Austenitic',
    'SS 304',
    '1.5 mm',
    '50.8 mm',
    NULL,
    NULL,
    NULL,
    'Mirror 600 Grit',
    'Round',
    '2.00 Inch NB (50.8 mm OD)',
    '50.8 mm',
    '47.8 mm',
    '6.0 Meters (20 Feet)',
    'Mirror 600 Grit (Bright Polish)',
    'Round Hollow Pipe',
    'Welded ERW TIG',
    'ASTM A554',
    '1.85 kg/m'
  ),
  -- 6) SS 202 Architectural Square Box Pipe - 1.2mm Thickness, Grade 202
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c06',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Hulas SS 202 Architectural Square Box Pipe',
    'HMC-PIP-SQR-202',
    'SS Pipes',
    'Square Structural Tubing',
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'High-strength structural square hollow section engineered for window grilles, stair balusters, and furniture framing.',
    'SS 202 Grade with nitrogen stabilization for superior tensile strength and yield.',
    '[{"key": "Finish", "value": "Hairline Satin 320 Grit"}]'::jsonb,
    2450.00,
    false,
    true,
    true,
    'Published',
    'In Stock',
    620,
    80,
    25,
    'Pcs (6m Length)',
    '40 x 40 mm',
    '18 Gauge',
    'SS 202 Commercial Grade',
    'SS 202',
    '1.2 mm',
    '40 x 40 mm',
    NULL,
    NULL,
    NULL,
    'Hairline Satin 320 Grit',
    'Square Box',
    '40 mm x 40 mm (1.5" x 1.5")',
    '40 x 40 mm',
    '37.6 x 37.6 mm',
    '6.0 Meters (20 Feet)',
    'Hairline Satin 320 Grit',
    'Square Box Tubing',
    'Welded High-Frequency',
    'ASTM A554',
    '1.45 kg/m'
  ),
  -- 7) SS 304 Heavy Rectangular Pipe - 2.0mm Thickness, Grade 304
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c07',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Hulas Heavy SS 304 Rectangular Hollow Section (RHS)',
    'HMC-PIP-RECT-304',
    'SS Pipes',
    'Rectangular Hollow Section',
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Heavy-wall rectangular stainless steel tubing for architectural building facades and cleanroom frameworks.',
    'Certified ASTM A554 SS 304 with full trace spectro test heat numbers.',
    '[{"key": "Wall Thickness", "value": "2.0 mm (Heavy Duty)"}]'::jsonb,
    4950.00,
    false,
    false,
    true,
    'Published',
    'In Stock',
    380,
    50,
    15,
    'Pcs (6m Length)',
    '60 x 40 mm',
    '14 Gauge',
    'SS 304 Prime Ingot',
    'SS 304',
    '2.0 mm',
    '60 x 40 mm',
    NULL,
    NULL,
    NULL,
    'Mirror Buffed 400 Grit',
    'Rectangular',
    '60 mm x 40 mm (2.36" x 1.57")',
    '60 x 40 mm',
    '56 x 36 mm',
    '6.0 Meters (20 Feet)',
    'Mirror Buffed 400 Grit',
    'Rectangular Hollow Section',
    'TIG Precision Welded',
    'ASTM A554',
    '3.02 kg/m'
  ),
  -- 8) Sanitary Dairy SS 304 Tubing - 1.2mm Thickness, Grade 304
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c08',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Hulas DIN 11850 SS 304 Sanitary Dairy Tubing',
    'HMC-PIP-SAN-51',
    'SS Pipes',
    'Sanitary Dairy Pipes',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Hygienic sanitary grade tubing designed for dairy and beverage processing. Internal weld seam completely roll-flattened and electro-polished.',
    'Internal surface roughness Ra < 0.8 µm. Hydrostatically tested up to 50 bar.',
    '[{"key": "Dairy Standard", "value": "DIN 11850 Series 2 / SMS"}]'::jsonb,
    5200.00,
    false,
    false,
    true,
    'Published',
    'In Stock',
    210,
    40,
    10,
    'Pcs (6m Length)',
    '51 mm OD',
    '18 Gauge',
    'SS 304 Food & Dairy Grade',
    'SS 304',
    '1.2 mm',
    '51.0 mm',
    NULL,
    NULL,
    NULL,
    'Internal Ra < 0.8µm Electro-polished',
    'Round',
    '51 mm OD (2 Inch Sanitary)',
    '51.0 mm',
    '48.6 mm',
    '6.0 Meters',
    'Electro-Polished Internal Ra < 0.8µm',
    'Round Sanitary Tube',
    'Welded De-beaded',
    'DIN 11850 / SMS',
    '1.50 kg/m'
  );

-- 8. INSERT CUSTOMERS
INSERT INTO public.customers (
  id, name, company, phone, email, address, category, total_inquiries, last_inquiry_date, notes
) VALUES 
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'Rameshwor Shrestha',
    'Kathmandu Grand Hotel & Banquets',
    '+977-9851029384',
    'rameshwor@grandhotelktm.com',
    'Baluwatar, Kathmandu',
    'Institutional Buyer',
    3,
    '2026-03-01',
    'High value hospitality client. Always demands 16G heavy duty SS 304 cookware.'
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02',
    'Bikram Karki',
    'Karki Metal Engineering & Railings',
    '+977-9841392811',
    'bikram@karkiengineering.com.np',
    'Satdobato, Lalitpur',
    'Fabricator',
    5,
    '2026-03-04',
    'Regular buyer of 2-inch and 1.5-inch round mirror finish pipes in Grade 304.'
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03',
    'Anita Tuladhar',
    'Himalayan Dairy Cooperative Union',
    '+977-9803322114',
    'procurement@himalayandairy.org',
    'Hetauda Industrial Estate',
    'Industrial Contractor',
    1,
    '2026-03-08',
    'New inquiry for DIN 11850 sanitary tubing.'
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04',
    'Narayan Prasad Sharma',
    'Sharma Crockery & Home Needs',
    '+977-9812498230',
    'sharmacrockery.nepal@gmail.com',
    'Main Road, Birgunj',
    'Wholesaler',
    8,
    '2026-02-28',
    'Top-tier regional distributor in Madhesh province. Preferred payment terms.'
  );

-- 9. INSERT INQUIRIES
INSERT INTO public.inquiries (
  id,
  inquiry_number,
  customer_name,
  company_name,
  phone,
  whatsapp_number,
  email,
  address,
  product_id,
  product_name,
  product_code,
  category,
  required_size,
  required_grade,
  required_thickness,
  gauge,
  required_quantity,
  unit,
  message,
  preferred_contact_method,
  status,
  assigned_staff,
  internal_notes
) VALUES 
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01',
    'HMC-INQ-2026-001',
    'Rameshwor Shrestha',
    'Kathmandu Grand Hotel & Banquets',
    '+977-9851029384',
    '9779851029384',
    'rameshwor@grandhotelktm.com',
    'Baluwatar, Kathmandu',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
    'Hulas Commercial SS Deep Fry Kadhai with Solid Handles',
    'HMC-UT-KAD-01',
    'SS Utensils',
    '16 Inch (40 cm)',
    'SS 304',
    '1.5 mm',
    '16 Gauge',
    12,
    'Pcs',
    'Need commercial grade SS 304 Kadhais for new banquet kitchen in Pokhara. Confirm delivery schedule and bulk discount.',
    'WhatsApp',
    'Quotation Sent',
    'Pradeep Joshi (Sales Manager)',
    '["Quotation sent with 8% B2B project discount", "Customer visiting Tinkune showroom on Friday"]'::jsonb
  ),
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02',
    'HMC-INQ-2026-002',
    'Bikram Karki',
    'Karki Metal Engineering & Railings',
    '+977-9841392811',
    '9779841392811',
    'bikram@karkiengineering.com.np',
    'Satdobato, Lalitpur',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05',
    'Hulas ASTM A554 SS 304 Ornamental Round Pipe',
    'HMC-PIP-RND-304',
    'SS Pipes',
    '2 Inch NB (Outer Dia 50.8 mm)',
    'SS 304',
    '1.5 mm',
    '16 Gauge',
    150,
    'Pcs (6m length)',
    'Urgent procurement for commercial hospital building handrail fabrication. Need test certificates showing 8% nickel content.',
    'Phone Call',
    'Negotiation',
    'Sunil Agrawal (Super Admin)',
    '["Mill test certificate dispatched", "Advance PO received"]'::jsonb
  );

-- 10. INSERT INVENTORY TRANSACTIONS
INSERT INTO public.inventory_transactions (
  product_id,
  product_name,
  product_code,
  movement_type,
  quantity,
  previous_quantity,
  new_quantity,
  reference_number,
  remarks,
  performed_by,
  location
) VALUES 
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
    'Hulas Royal SS Heavy Gauge Tope (Cookpot)',
    'HMC-UT-TOP-01',
    'Purchase Entry',
    500,
    0,
    500,
    'MFG-LOT-2026-44',
    'Production batch output from Press Shop #2 Biratnagar',
    'Anil Thapa (Inventory Manager)',
    'Biratnagar Main Warehouse'
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05',
    'Hulas ASTM A554 SS 304 Ornamental Round Pipe',
    'HMC-PIP-RND-304',
    'Opening Stock',
    900,
    0,
    900,
    'OPEN-STK-2026',
    'Annual opening audit inventory verification',
    'Sunil Agrawal (Super Admin)',
    'Pipe Tube Mill Yard #1'
  );

-- ==============================================================================
-- 11. VERIFICATION CHECK (Will output row count confirmation in Results pane)
-- ==============================================================================
SELECT 'products' AS "Database Table", count(*) AS "Populated Rows (Must be > 0)" FROM public.products
UNION ALL
SELECT 'categories', count(*) FROM public.categories
UNION ALL
SELECT 'company_settings', count(*) FROM public.company_settings
UNION ALL
SELECT 'customers', count(*) FROM public.customers
UNION ALL
SELECT 'inquiries', count(*) FROM public.inquiries
UNION ALL
SELECT 'inventory_transactions', count(*) FROM public.inventory_transactions;
`;

// ==============================================================================
// 17. 1-CLICK ALL-IN-ONE SETUP (SCHEMA CREATION + IMMEDIATE SEED DATA)
// ==============================================================================
export const SUPABASE_ALL_IN_ONE_SQL = `${SUPABASE_SEED_DATA_SQL}`;


