-- Create customers table (Minimal for now as a baseline for relations)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    gst_total NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own customers" ON public.customers
    FOR ALL USING (auth.uid() = business_id);

CREATE POLICY "Users can manage their own invoices" ON public.invoices
    FOR ALL USING (auth.uid() = business_id);

CREATE POLICY "Users can manage their own invoice items" ON public.invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE id = public.invoice_items.invoice_id 
            AND business_id = auth.uid()
        )
    );

-- Trigger to reduce stock on invoice item creation
CREATE OR REPLACE FUNCTION public.reduce_stock_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_reduce_stock_on_invoice
AFTER INSERT ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_invoice();

-- Create indexes
CREATE INDEX IF NOT EXISTS customers_business_id_idx ON public.customers (business_id);
CREATE INDEX IF NOT EXISTS invoices_business_id_idx ON public.invoices (business_id);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON public.invoice_items (invoice_id);
