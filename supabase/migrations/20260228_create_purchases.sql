-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    purchase_number TEXT NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    cost_price NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own suppliers" ON public.suppliers
    FOR ALL USING (auth.uid() = business_id);

CREATE POLICY "Users can manage their own purchases" ON public.purchases
    FOR ALL USING (auth.uid() = business_id);

CREATE POLICY "Users can manage their own purchase items" ON public.purchase_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.purchases 
            WHERE id = public.purchase_items.purchase_id 
            AND business_id = auth.uid()
        )
    );

-- Trigger to INCREASE stock on purchase item creation
CREATE OR REPLACE FUNCTION public.increase_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_increase_stock_on_purchase
AFTER INSERT ON public.purchase_items
FOR EACH ROW EXECUTE FUNCTION public.increase_stock_on_purchase();

-- Create indexes
CREATE INDEX IF NOT EXISTS suppliers_business_id_idx ON public.suppliers (business_id);
CREATE INDEX IF NOT EXISTS purchases_business_id_idx ON public.purchases (business_id);
CREATE INDEX IF NOT EXISTS purchase_items_purchase_id_idx ON public.purchase_items (purchase_id);
