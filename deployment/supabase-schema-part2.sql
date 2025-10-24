-- ============================================
-- I TRUSTY LTD - SUPABASE DATABASE SCHEMA (PART 2)
-- ============================================
-- Remaining 30 tables (18-47)
-- ============================================

-- TABLE 18: bank_accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name TEXT NOT NULL,
    account_number TEXT,
    bank_name TEXT,
    currency TEXT DEFAULT 'EUR',
    account_type TEXT,
    country TEXT,
    balance DECIMAL(12,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    swift_code TEXT,
    iban TEXT,
    office TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 19: payment_transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number TEXT UNIQUE,
    account_id UUID REFERENCES financial_accounts(id),
    account_name TEXT,
    transaction_date DATE NOT NULL,
    transaction_type TEXT,
    amount DECIMAL(12,2),
    currency TEXT DEFAULT 'EUR',
    related_ref TEXT,
    description TEXT,
    payment_method TEXT,
    balance_before DECIMAL(12,2),
    balance_after DECIMAL(12,2),
    created_by TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 20: customer_payments
CREATE TABLE customer_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    customer_code TEXT,
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2),
    currency TEXT DEFAULT 'EUR',
    amount_eur DECIMAL(12,2),
    amount_rmb DECIMAL(12,2),
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 21: supplier_payments
CREATE TABLE supplier_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    supplier_name TEXT,
    payment_amount_rmb DECIMAL(12,2),
    payment_date DATE NOT NULL,
    payment_method TEXT,
    payment_reference TEXT,
    bank_account_id UUID REFERENCES bank_accounts(id),
    notes TEXT,
    status TEXT DEFAULT 'pending',
    paid_by_staff_id UUID REFERENCES staff_members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 22: salespersons
CREATE TABLE salespersons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    default_commission_rate DECIMAL(5,2),
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 23: company_expenses
CREATE TABLE company_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_category TEXT,
    subcategory TEXT,
    expense_date DATE NOT NULL,
    amount DECIMAL(12,2),
    currency TEXT DEFAULT 'RMB',
    bank_account TEXT,
    payment_method TEXT,
    payee TEXT,
    office TEXT,
    status TEXT DEFAULT 'paid',
    recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT,
    recurring_day INTEGER,
    invoice_number TEXT,
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 24: office_financials
CREATE TABLE office_financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    office_name TEXT NOT NULL,
    month TEXT NOT NULL,
    revenue DECIMAL(12,2) DEFAULT 0,
    staff_costs DECIMAL(12,2) DEFAULT 0,
    rent_costs DECIMAL(12,2) DEFAULT 0,
    other_costs DECIMAL(12,2) DEFAULT 0,
    net_profit DECIMAL(12,2) DEFAULT 0,
    profit_margin_percent DECIMAL(5,2),
    currency TEXT DEFAULT 'RMB',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 25: packing_lists
CREATE TABLE packing_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    packing_list_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    order_reference TEXT,
    customer_name TEXT,
    customer_address TEXT,
    customer_contact TEXT,
    customer_phone TEXT,
    destination_port TEXT,
    container_number TEXT,
    shipping_marks TEXT,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total_ctns INTEGER DEFAULT 0,
    total_weight_kg DECIMAL(10,2) DEFAULT 0,
    total_volume_cbm DECIMAL(10,3) DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 26: customer_orders
CREATE TABLE customer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_code TEXT,
    customer_name TEXT,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    currency TEXT DEFAULT 'EUR',
    total_amount DECIMAL(12,2),
    deposit_amount DECIMAL(12,2),
    balance_amount DECIMAL(12,2),
    product_description TEXT,
    quantity INTEGER,
    status TEXT DEFAULT 'pending',
    assigned_to TEXT,
    office TEXT,
    shipping_method TEXT,
    incoterms TEXT,
    notes TEXT,
    profit_margin_percent DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 27: supplier_orders
CREATE TABLE supplier_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    related_customer_order_id UUID REFERENCES customer_orders(id),
    related_customer_order_number TEXT,
    supplier_name TEXT,
    supplier_code TEXT,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    currency TEXT DEFAULT 'RMB',
    total_amount DECIMAL(12,2),
    payment_status TEXT DEFAULT 'pending',
    amount_paid DECIMAL(12,2) DEFAULT 0,
    product_description TEXT,
    quantity INTEGER,
    status TEXT DEFAULT 'pending',
    order_type TEXT,
    assigned_to TEXT,
    office TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 28: order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_name TEXT,
    product_code TEXT,
    quantity INTEGER,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    supplier_name TEXT,
    supplier_cost DECIMAL(12,2),
    profit_margin DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 29: workflow_steps
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_order INTEGER,
    step_name TEXT NOT NULL,
    step_type TEXT,
    status TEXT DEFAULT 'pending',
    assigned_to_id UUID REFERENCES staff_members(id),
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    cost_rmb DECIMAL(12,2),
    notes TEXT,
    notes_zh TEXT,
    parent_step_id UUID REFERENCES workflow_steps(id),
    dependencies TEXT[],
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 30: order_workflow_steps
CREATE TABLE order_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    assigned_to TEXT,
    status TEXT DEFAULT 'pending',
    start_date DATE,
    completed_date DATE,
    duration_days INTEGER,
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 31: workflow_step_comments
CREATE TABLE workflow_step_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    staff_id UUID REFERENCES staff_members(id),
    staff_name TEXT,
    comment_text TEXT NOT NULL,
    comment_type TEXT DEFAULT 'general',
    attachments JSONB DEFAULT '[]'::jsonb,
    is_internal BOOLEAN DEFAULT false,
    mentioned_staff_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 32: workflow_template_steps
CREATE TABLE workflow_template_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    default_duration_days INTEGER,
    default_assigned_office TEXT,
    description TEXT,
    required_documents TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 33: order_workflow_templates
CREATE TABLE order_workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL,
    template_name_zh TEXT,
    order_type TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT false,
    created_by TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 34: project_templates
CREATE TABLE project_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL,
    template_name_zh TEXT,
    project_category TEXT,
    default_steps JSONB DEFAULT '[]'::jsonb,
    estimated_duration_days INTEGER,
    typical_team_size INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 35: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff_members(id),
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    priority TEXT DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    action_label TEXT,
    related_entity_id UUID,
    related_entity_type TEXT,
    sent_via TEXT DEFAULT 'web',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 36: notifications_alerts
CREATE TABLE notifications_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES staff_members(id),
    alert_type TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    related_order_id UUID REFERENCES orders(id),
    related_project_id UUID REFERENCES projects(id),
    related_workflow_step_id UUID REFERENCES workflow_steps(id),
    title TEXT NOT NULL,
    title_zh TEXT,
    message TEXT,
    message_zh TEXT,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    action_required BOOLEAN DEFAULT false,
    action_url TEXT
);

-- TABLE 37: wechat_notifications
CREATE TABLE wechat_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_staff_id UUID REFERENCES staff_members(id),
    wechat_id TEXT,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    order_number TEXT,
    step_name TEXT,
    action_url TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivery_status TEXT DEFAULT 'pending',
    read_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal'
);

-- TABLE 38: activity_feed
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    activity_type TEXT NOT NULL,
    order_id UUID REFERENCES orders(id),
    order_number TEXT,
    staff_id UUID REFERENCES staff_members(id),
    staff_name TEXT,
    step_name TEXT,
    action_description TEXT NOT NULL,
    action_description_zh TEXT,
    old_status TEXT,
    new_status TEXT,
    amount DECIMAL(12,2),
    currency TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- TABLE 39: sales_tracking
CREATE TABLE sales_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_person_id UUID REFERENCES staff_members(id),
    lead_source TEXT,
    client_name TEXT,
    client_contact TEXT,
    order_id UUID REFERENCES orders(id),
    stage TEXT DEFAULT 'lead',
    estimated_value_rmb DECIMAL(12,2),
    actual_value_rmb DECIMAL(12,2),
    commission_earned_rmb DECIMAL(12,2),
    commission_paid BOOLEAN DEFAULT false,
    notes TEXT,
    last_contact_date DATE,
    next_follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 40: team_members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_zh TEXT,
    role TEXT,
    role_zh TEXT,
    department TEXT,
    office_location TEXT,
    email TEXT,
    phone TEXT,
    wechat_id TEXT,
    is_sales_person BOOLEAN DEFAULT false,
    commission_rate DECIMAL(5,2),
    skills TEXT[],
    languages TEXT[],
    base_salary_rmb DECIMAL(12,2),
    hourly_rate_rmb DECIMAL(10,2),
    hire_date DATE,
    active BOOLEAN DEFAULT true,
    can_receive_notifications BOOLEAN DEFAULT true,
    notification_preference TEXT DEFAULT 'email',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 41: production_tracking
CREATE TABLE production_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    workflow_step_id UUID REFERENCES workflow_steps(id),
    supplier_name TEXT,
    product_codes TEXT[],
    quantity INTEGER,
    production_start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    production_days INTEGER,
    status TEXT DEFAULT 'pending',
    requires_private_label BOOLEAN DEFAULT false,
    label_design_approved BOOLEAN DEFAULT false,
    factory_packed BOOLEAN DEFAULT false,
    warehouse_location TEXT,
    sync_with_production_ids UUID[],
    notes TEXT,
    notes_zh TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 42: shipping_tracking
CREATE TABLE shipping_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    workflow_step_id UUID REFERENCES workflow_steps(id),
    shipping_agent TEXT,
    shipping_method TEXT,
    estimated_shipping_cost_rmb DECIMAL(12,2),
    actual_shipping_cost_rmb DECIMAL(12,2),
    pre_shipment_quote_date DATE,
    final_quote_date DATE,
    commercial_invoice_number TEXT,
    packing_list_number TEXT,
    fob_completed BOOLEAN DEFAULT false,
    customs_declared BOOLEAN DEFAULT false,
    export_date DATE,
    tracking_number TEXT,
    telex_release_provided BOOLEAN DEFAULT false,
    final_payment_confirmed BOOLEAN DEFAULT false,
    notes TEXT,
    notes_zh TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 43: project_costs
CREATE TABLE project_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    cost_type TEXT,
    cost_rmb DECIMAL(12,2),
    cost_usd DECIMAL(12,2),
    cost_eur DECIMAL(12,2),
    staff_id UUID REFERENCES staff_members(id),
    supplier_name TEXT,
    description TEXT,
    description_zh TEXT,
    invoice_number TEXT,
    payment_date DATE,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 44: staff_payroll
CREATE TABLE staff_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff_members(id),
    base_salary_rmb DECIMAL(12,2),
    base_salary_eur DECIMAL(12,2),
    hourly_rate_rmb DECIMAL(10,2),
    bonus_percentage DECIMAL(5,2),
    current_month_hours INTEGER,
    current_month_bonus_rmb DECIMAL(12,2),
    benefits_rmb DECIMAL(12,2),
    housing_allowance_rmb DECIMAL(12,2),
    total_monthly_cost_rmb DECIMAL(12,2),
    ytd_salary_rmb DECIMAL(12,2),
    ytd_bonus_rmb DECIMAL(12,2),
    payment_method TEXT,
    payment_day INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 45: staff_permissions
CREATE TABLE staff_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff_members(id),
    can_log_activities BOOLEAN DEFAULT true,
    can_view_own_activities BOOLEAN DEFAULT true,
    can_view_team_activities BOOLEAN DEFAULT false,
    can_approve_activities BOOLEAN DEFAULT false,
    access_level TEXT DEFAULT 'staff',
    managed_staff_ids UUID[],
    assigned_by UUID REFERENCES staff_members(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 46: user_roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    role_name_cn TEXT,
    role_level INTEGER,
    description TEXT,
    description_cn TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 47: account_transfers
CREATE TABLE account_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_number TEXT UNIQUE,
    transfer_date DATE NOT NULL,
    from_account_id UUID REFERENCES financial_accounts(id),
    from_account_name TEXT,
    from_currency TEXT,
    from_amount DECIMAL(12,2),
    to_account_id UUID REFERENCES financial_accounts(id),
    to_account_name TEXT,
    to_currency TEXT,
    to_amount DECIMAL(12,2),
    fx_rate DECIMAL(10,4),
    fx_rate_editable BOOLEAN DEFAULT true,
    notes TEXT,
    created_by TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR ALL TABLES
-- ============================================

CREATE INDEX idx_bank_accounts_active ON bank_accounts(active);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(transaction_date);
CREATE INDEX idx_payment_transactions_account ON payment_transactions(account_id);
CREATE INDEX idx_customer_payments_customer ON customer_payments(customer_code);
CREATE INDEX idx_customer_payments_date ON customer_payments(payment_date);
CREATE INDEX idx_supplier_payments_order ON supplier_payments(order_id);
CREATE INDEX idx_supplier_payments_date ON supplier_payments(payment_date);
CREATE INDEX idx_company_expenses_date ON company_expenses(expense_date);
CREATE INDEX idx_company_expenses_office ON company_expenses(office);
CREATE INDEX idx_packing_lists_number ON packing_lists(packing_list_number);
CREATE INDEX idx_customer_orders_number ON customer_orders(order_number);
CREATE INDEX idx_customer_orders_customer ON customer_orders(customer_code);
CREATE INDEX idx_supplier_orders_number ON supplier_orders(order_number);
CREATE INDEX idx_supplier_orders_supplier ON supplier_orders(supplier_name);
CREATE INDEX idx_workflow_steps_order ON workflow_steps(order_id);
CREATE INDEX idx_workflow_steps_project ON workflow_steps(project_id);
CREATE INDEX idx_order_workflow_steps_order ON order_workflow_steps(order_id);
CREATE INDEX idx_notifications_staff ON notifications(staff_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_activity_feed_order ON activity_feed(order_id);
CREATE INDEX idx_activity_feed_timestamp ON activity_feed(timestamp);
CREATE INDEX idx_production_tracking_order ON production_tracking(order_id);
CREATE INDEX idx_shipping_tracking_order ON shipping_tracking(order_id);
CREATE INDEX idx_project_costs_project ON project_costs(project_id);

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
