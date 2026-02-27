-- Create products table
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

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can select their own business products" 
ON public.products FOR SELECT 
USING (auth.uid() = business_id);

CREATE POLICY "Users can insert their own business products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can update their own business products" 
ON public.products FOR UPDATE 
USING (auth.uid() = business_id);

CREATE POLICY "Users can delete their own business products" 
ON public.products FOR DELETE 
USING (auth.uid() = business_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS products_business_id_idx ON public.products (business_id);
