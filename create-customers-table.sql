-- Create customers table in Supabase
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    tax_id TEXT,
    payment_terms TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations on customers" ON public.customers
    FOR ALL USING (true) WITH CHECK (true);
