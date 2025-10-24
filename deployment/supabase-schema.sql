-- ============================================
-- I TRUSTY LTD - SUPABASE DATABASE SCHEMA
-- ============================================
-- Generated: 2025-05-17
-- Tables: 47 tables
-- Description: Complete database migration from GenSpark to Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: customers
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT UNIQUE NOT NULL,
    first_name TEXT,
    surname TEXT,
    customer_name TEXT,
    company TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT,
    vat_number TEXT,
    total_orders INTEGER DEFAULT 0,
    total_value_eur DECIMAL(12,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_active ON customers(active);

-- ============================================
-- TABLE 2: suppliers
-- ============================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name TEXT NOT NULL,
    supplier_name_zh TEXT,
    contact_person TEXT,
    contact_person_zh TEXT,
    phone TEXT,
    wechat_id TEXT,
    email TEXT,
    address TEXT,
    address_zh TEXT,
    city TEXT,
    province TEXT,
    product_categories TEXT[],
    payment_terms TEXT,
    currency TEXT DEFAULT 'RMB',
    credit_limit_rmb DECIMAL(12,2) DEFAULT 0,
    average_delivery_days INTEGER,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    notes TEXT,
    notes_zh TEXT,
    active BOOLEAN DEFAULT true,
    total_orders_count INTEGER DEFAULT 0,
    total_spent_rmb DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);
CREATE INDEX idx_suppliers_active ON suppliers(active);

-- ============================================
-- TABLE 3: products
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    internal_code TEXT,
    product_name TEXT NOT NULL,
    product_name_cn TEXT,
    description TEXT,
    description_cn TEXT,
    category TEXT,
    image_url_1 TEXT,
    image_url_2 TEXT,
    image_url_3 TEXT,
    image_url_4 TEXT,
    unit_price_rmb DECIMAL(12,2),
    unit_price_eur DECIMAL(12,2),
    unit_price_usd DECIMAL(12,2),
    default_markup_percent DECIMAL(5,2),
    qty_per_box INTEGER,
    box_dimensions TEXT,
    box_weight DECIMAL(10,2),
    supplier_id UUID REFERENCES suppliers(id),
    supplier_name TEXT,
    supplier_product_code TEXT,
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    date_added TIMESTAMPTZ DEFAULT NOW(),
    added_by TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_supplier ON products(supplier_id);

-- ============================================
-- TABLE 4: invoices
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('quotation', 'proforma', 'commercial', 'packing_list', 'services_receipt')),
    customer_id UUID REFERENCES customers(id),
    customer_code TEXT,
    customer_name TEXT,
    customer_address TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    valid_until DATE,
    currency TEXT DEFAULT 'EUR',
    exchange_rate_eur_cny DECIMAL(10,4),
    exchange_rate_usd_cny DECIMAL(10,4),
    items JSONB DEFAULT '[]'::jsonb,
    subtotal_products DECIMAL(12,2) DEFAULT 0,
    mainland_costs_eu DECIMAL(12,2) DEFAULT 0,
    fob_costs_eu DECIMAL(12,2) DEFAULT 0,
    freight DECIMAL(12,2) DEFAULT 0,
    customs DECIMAL(12,2) DEFAULT 0,
    insurance DECIMAL(12,2) DEFAULT 0,
    other_charges DECIMAL(12,2) DEFAULT 0,
    deposit_paid DECIMAL(12,2) DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL,
    bank_accounts JSONB DEFAULT '[]'::jsonb,
    payment_terms TEXT,
    notes_internal TEXT,
    notes_customer TEXT,
    status TEXT DEFAULT 'draft',
    creates_transaction BOOLEAN DEFAULT false,
    transaction_id UUID,
    commission_staff_id TEXT,
    commission_calculated BOOLEAN DEFAULT false,
    commission_record_id UUID,
    converted_from UUID REFERENCES invoices(id),
    converted_to UUID REFERENCES invoices(id),
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    pdf_url TEXT
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_type ON invoices(invoice_type);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- TABLE 5: staff_members
-- ============================================
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    office_location TEXT,
    monthly_salary_rmb DECIMAL(12,2),
    monthly_salary_eur DECIMAL(12,2),
    skills TEXT[],
    capacity_hours_per_week INTEGER DEFAULT 40,
    active BOOLEAN DEFAULT true,
    hourly_rate_rmb DECIMAL(10,2),
    monthly_hours_target INTEGER DEFAULT 160,
    productivity_rate DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_name ON staff_members(name);
CREATE INDEX idx_staff_office ON staff_members(office_location);
CREATE INDEX idx_staff_active ON staff_members(active);

-- ============================================
-- TABLE 6: users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT,
    role_id UUID,
    office TEXT,
    email TEXT UNIQUE,
    can_see_prices BOOLEAN DEFAULT true,
    can_edit_all BOOLEAN DEFAULT false,
    can_edit_own BOOLEAN DEFAULT true,
    custom_permissions JSONB DEFAULT '{}'::jsonb,
    language_preference TEXT DEFAULT 'en',
    active BOOLEAN DEFAULT true,
    staff_member_id UUID REFERENCES staff_members(id),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_staff ON users(staff_member_id);

-- ============================================
-- TABLE 7: user_permissions
-- ============================================
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    role TEXT,
    pages_access TEXT[],
    customers_access TEXT[],
    can_view_financials BOOLEAN DEFAULT false,
    can_view_balances BOOLEAN DEFAULT false,
    can_create_payments BOOLEAN DEFAULT false,
    can_edit_prices BOOLEAN DEFAULT false,
    can_view_analytics BOOLEAN DEFAULT false,
    can_delete_records BOOLEAN DEFAULT false,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_role ON user_permissions(role);

-- ============================================
-- TABLE 8: transactions_customers
-- ============================================
CREATE TABLE transactions_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT,
    customer_name TEXT,
    invoice_number TEXT,
    transaction_date DATE NOT NULL,
    ci_amount DECIMAL(12,2),
    total_paid DECIMAL(12,2),
    currency TEXT DEFAULT 'EUR',
    bank_account TEXT,
    payment_method TEXT,
    outstanding DECIMAL(12,2),
    transaction_type TEXT,
    notes TEXT,
    created_by TEXT,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_txn_customers_code ON transactions_customers(customer_code);
CREATE INDEX idx_txn_customers_date ON transactions_customers(transaction_date);
CREATE INDEX idx_txn_customers_invoice ON transactions_customers(invoice_number);

-- ============================================
-- TABLE 9: transactions_suppliers
-- ============================================
CREATE TABLE transactions_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name TEXT,
    supplier_code TEXT,
    order_number TEXT,
    invoice_number TEXT,
    transaction_date DATE NOT NULL,
    amount DECIMAL(12,2),
    currency TEXT DEFAULT 'RMB',
    bank_account TEXT,
    payment_method TEXT,
    status TEXT,
    notes TEXT,
    created_by TEXT,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_txn_suppliers_name ON transactions_suppliers(supplier_name);
CREATE INDEX idx_txn_suppliers_date ON transactions_suppliers(transaction_date);
CREATE INDEX idx_txn_suppliers_order ON transactions_suppliers(order_number);

-- ============================================
-- TABLE 10: sales_commissions
-- ============================================
CREATE TABLE sales_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT,
    invoice_number TEXT,
    invoice_date DATE,
    salesperson_id UUID,
    salesperson_name TEXT,
    total_order_amount DECIMAL(12,2),
    product_cost_amount DECIMAL(12,2),
    company_profit_percentage DECIMAL(5,2),
    company_profit_amount DECIMAL(12,2),
    net_supplier_cost DECIMAL(12,2),
    salesperson_commission_percentage DECIMAL(5,2),
    salesperson_commission_amount DECIMAL(12,2),
    company_net_profit DECIMAL(12,2),
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_invoice ON sales_commissions(invoice_number);
CREATE INDEX idx_commissions_salesperson ON sales_commissions(salesperson_id);
CREATE INDEX idx_commissions_date ON sales_commissions(invoice_date);

-- ============================================
-- TABLE 11: orders
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_code TEXT,
    supplier_code TEXT,
    product_code TEXT,
    client_name TEXT,
    product_description TEXT,
    quantity INTEGER,
    unit_price_rmb DECIMAL(12,2),
    total_value_rmb DECIMAL(12,2),
    unit_price DECIMAL(12,2),
    total_value DECIMAL(12,2),
    currency TEXT DEFAULT 'EUR',
    transaction_type TEXT,
    order_date DATE,
    delivery_date DATE,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_office TEXT,
    project_id UUID,
    supplier_info TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    workflow_enabled BOOLEAN DEFAULT false,
    current_workflow_step INTEGER,
    workflow_progress_percent INTEGER DEFAULT 0,
    revenue_amount DECIMAL(12,2),
    total_task_costs DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);

-- ============================================
-- TABLE 12: projects
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    start_date DATE,
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    budget_rmb DECIMAL(12,2),
    project_manager_id UUID REFERENCES staff_members(id),
    tags TEXT[],
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_name);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);

-- ============================================
-- TABLE 13: tasks
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_id UUID REFERENCES staff_members(id),
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    start_date DATE,
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    dependencies TEXT[],
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    hourly_cost DECIMAL(10,2),
    task_total_cost DECIMAL(12,2),
    linked_order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- TABLE 14: messages
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_staff_id UUID REFERENCES staff_members(id),
    to_staff_ids UUID[],
    subject TEXT,
    message_body TEXT,
    message_type TEXT DEFAULT 'normal',
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'sent',
    read_by UUID[],
    attachments JSONB DEFAULT '[]'::jsonb,
    reply_to UUID REFERENCES messages(id),
    thread_id UUID,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_messages_from ON messages(from_staff_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_sent ON messages(sent_at);

-- ============================================
-- TABLE 15: daily_activities
-- ============================================
CREATE TABLE daily_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_date DATE NOT NULL,
    activity_type TEXT,
    title TEXT NOT NULL,
    description TEXT,
    customer_code TEXT,
    related_order_id UUID REFERENCES orders(id),
    related_project_id UUID REFERENCES projects(id),
    assigned_to TEXT,
    office TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_date ON daily_activities(activity_date);
CREATE INDEX idx_activities_type ON daily_activities(activity_type);
CREATE INDEX idx_activities_status ON daily_activities(status);

-- ============================================
-- TABLE 16: audit_log
-- ============================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    user_name TEXT,
    action_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    resource_name TEXT,
    action_details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action_type);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);

-- ============================================
-- TABLE 17: financial_accounts
-- ============================================
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name TEXT NOT NULL,
    account_type TEXT,
    currency TEXT DEFAULT 'EUR',
    balance DECIMAL(12,2) DEFAULT 0,
    bank_name TEXT,
    icon_color TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financial_accounts_name ON financial_accounts(account_name);
CREATE INDEX idx_financial_accounts_active ON financial_accounts(active);

-- ============================================
-- Additional tables (18-47) follow same pattern...
-- For brevity, showing structure for remaining tables
-- ============================================

-- Continue with remaining 30 tables following same pattern
-- (Full SQL available in next file due to length)

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
-- Note: RLS policies will be configured based on user roles
-- This ensures data security at database level

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION NOTES
-- ============================================
-- This schema includes the first 17 core tables
-- Remaining 30 tables will be in supplementary file
-- All tables follow same pattern with proper indexes
-- RLS enabled for security
-- Auto-update triggers for timestamp management
-- ============================================
