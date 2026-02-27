-- CONSOLIDATED SCHEMA FIX
-- This script ensures all tables exist, data types are correct, and RLS is enabled.

-- 1. Create missing tables if they don't exist, or fix their types if they do.

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT,
    purchase_price NUMERIC(12, 2),
    selling_price NUMERIC(12, 2),
    gst_rate NUMERIC(5, 2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure correct types for Products in case they exist as TEXT
ALTER TABLE public.products 
    ALTER COLUMN purchase_price TYPE NUMERIC(12, 2) USING purchase_price::numeric,
    ALTER COLUMN selling_price TYPE NUMERIC(12, 2) USING selling_price::numeric,
    ALTER COLUMN gst_rate TYPE NUMERIC(5, 2) USING gst_rate::numeric;

-- SETTINGS
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT,
    gst_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.expenses 
    ALTER COLUMN amount TYPE NUMERIC(12, 2) USING amount::numeric;

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    gst_total NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices 
    ALTER COLUMN subtotal TYPE NUMERIC(12, 2) USING subtotal::numeric,
    ALTER COLUMN gst_total TYPE NUMERIC(12, 2) USING gst_total::numeric,
    ALTER COLUMN total_amount TYPE NUMERIC(12, 2) USING total_amount::numeric;

-- INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    gst_rate NUMERIC(5, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoice_items 
    ALTER COLUMN price TYPE NUMERIC(12, 2) USING price::numeric,
    ALTER COLUMN gst_rate TYPE NUMERIC(5, 2) USING gst_rate::numeric,
    ALTER COLUMN total TYPE NUMERIC(12, 2) USING total::numeric;

-- PURCHASES
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID, -- References suppliers if exists
    purchase_number TEXT NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.purchases 
    ALTER COLUMN total_amount TYPE NUMERIC(12, 2) USING total_amount::numeric;

-- PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    cost_price NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.purchase_items 
    ALTER COLUMN cost_price TYPE NUMERIC(12, 2) USING cost_price::numeric,
    ALTER COLUMN total TYPE NUMERIC(12, 2) USING total::numeric;

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Note: Policies are assumed to exist or be created via standard migrations.
-- This script focuses on structure and types.
