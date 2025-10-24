-- ============================================
-- I TRUSTY LTD - TEST DATA CREATION
-- ============================================
-- This script creates sample data for testing
-- Execute in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TEST CUSTOMERS (20 records)
-- ============================================

INSERT INTO customers (customer_code, customer_name, company, email, phone, address, city, country, active, total_orders, total_value_eur) VALUES
('CUST001', 'John Smith', 'Smith Trading Ltd', 'john.smith@smithtrading.com', '+44 20 7123 4567', '123 Oxford Street', 'London', 'United Kingdom', true, 5, 15000.00),
('CUST002', 'Maria Garcia', 'Garcia Imports SA', 'maria@garciaimports.es', '+34 91 123 4567', 'Calle Mayor 45', 'Madrid', 'Spain', true, 8, 32000.00),
('CUST003', 'Hans Mueller', 'Mueller GmbH', 'hans@mueller-gmbh.de', '+49 30 1234567', 'Friedrichstraße 100', 'Berlin', 'Germany', true, 12, 48000.00),
('CUST004', 'Sophie Dubois', 'Dubois Commerce', 'sophie@duboiscommerce.fr', '+33 1 4567 8900', '25 Avenue des Champs', 'Paris', 'France', true, 3, 9500.00),
('CUST005', 'Luca Rossi', 'Rossi Trading SRL', 'luca@rossitrading.it', '+39 02 1234 5678', 'Via Milano 78', 'Milan', 'Italy', true, 6, 22000.00),
('CUST006', 'Anna Kowalski', 'Kowalski Distribution', 'anna@kowalski.pl', '+48 22 123 4567', 'ul. Marszałkowska 50', 'Warsaw', 'Poland', true, 4, 11000.00),
('CUST007', 'Petros Dimitriou', 'Dimitriou Bros', 'petros@dimitriou.gr', '+30 210 123 4567', 'Ermou 120', 'Athens', 'Greece', true, 9, 28000.00),
('CUST008', 'Lars Andersson', 'Andersson AB', 'lars@andersson.se', '+46 8 123 4567', 'Drottninggatan 45', 'Stockholm', 'Sweden', true, 2, 7500.00),
('CUST009', 'Eva Novak', 'Novak Trading', 'eva@novaktrading.cz', '+420 2 1234 5678', 'Václavské náměstí 20', 'Prague', 'Czech Republic', true, 5, 16000.00),
('CUST010', 'Michael O''Brien', 'O''Brien Wholesale', 'michael@obrienwholesale.ie', '+353 1 234 5678', '15 O''Connell Street', 'Dublin', 'Ireland', true, 7, 24000.00),
('CUST011', 'Sarah Johnson', 'Johnson Enterprises', 'sarah@johnsonent.com', '+1 212 555 0123', '500 5th Avenue', 'New York', 'USA', true, 10, 55000.00),
('CUST012', 'Ahmed Al-Rashid', 'Al-Rashid Trading', 'ahmed@alrashid.ae', '+971 4 123 4567', 'Sheikh Zayed Road', 'Dubai', 'UAE', true, 6, 38000.00),
('CUST013', 'Yuki Tanaka', 'Tanaka Corporation', 'yuki@tanaka.jp', '+81 3 1234 5678', 'Shibuya 2-chome', 'Tokyo', 'Japan', true, 4, 19000.00),
('CUST014', 'Carlos Silva', 'Silva Importações', 'carlos@silvaimport.br', '+55 11 1234 5678', 'Avenida Paulista 1000', 'São Paulo', 'Brazil', true, 3, 12000.00),
('CUST015', 'Anastasia Volkov', 'Volkov Trade', 'anastasia@volkovtrade.ru', '+7 495 123 4567', 'Tverskaya Street 10', 'Moscow', 'Russia', true, 8, 42000.00),
('CUST016', 'Kim Min-jun', 'Kim Trading Co', 'minjun@kimtrading.kr', '+82 2 1234 5678', 'Gangnam-gu', 'Seoul', 'South Korea', true, 5, 21000.00),
('CUST017', 'Isabella Romano', 'Romano Retail', 'isabella@romanoretail.com.au', '+61 2 1234 5678', 'George Street 250', 'Sydney', 'Australia', true, 4, 14000.00),
('CUST018', 'Henrik Nielsen', 'Nielsen Import', 'henrik@nielsen.dk', '+45 33 12 34 56', 'Strøget 45', 'Copenhagen', 'Denmark', true, 6, 18000.00),
('CUST019', 'Fatima Hassan', 'Hassan Wholesale', 'fatima@hassanwholesale.eg', '+20 2 1234 5678', 'Tahrir Square', 'Cairo', 'Egypt', true, 3, 9000.00),
('CUST020', 'Robert Williams', 'Williams Distribution', 'robert@williamsdist.ca', '+1 416 555 0123', 'King Street 100', 'Toronto', 'Canada', true, 7, 29000.00);

-- ============================================
-- 2. TEST SUPPLIERS (5 records)
-- ============================================

INSERT INTO suppliers (supplier_name, supplier_name_zh, contact_person, phone, wechat_id, email, city, province, product_categories, payment_terms, currency, quality_rating, reliability_rating, active, total_orders_count, total_spent_rmb) VALUES
('Yiwu Best Manufacturing', '义乌最佳制造', 'Zhang Wei', '+86 579 8512 3456', 'zhangwei_ywbest', 'zhangwei@ywbest.com', 'Yiwu', 'Zhejiang', ARRAY['Home & Garden', 'Kitchen Supplies', 'Storage'], '30% deposit, 70% before shipment', 'RMB', 5, 5, true, 45, 380000.00),
('Shenzhen Tech Products', '深圳科技产品', 'Liu Ming', '+86 755 2345 6789', 'liuming_sztech', 'liuming@sztechpro.cn', 'Shenzhen', 'Guangdong', ARRAY['Electronics', 'Smart Home', 'Accessories'], '50% deposit, 50% on delivery', 'RMB', 4, 5, true, 28, 520000.00),
('Guangzhou Quality Textiles', '广州优质纺织品', 'Wang Fang', '+86 20 8765 4321', 'wangfang_gztex', 'wangfang@gztextiles.com', 'Guangzhou', 'Guangdong', ARRAY['Textiles', 'Home Textiles', 'Fabrics'], 'T/T 30 days', 'RMB', 5, 4, true, 33, 290000.00),
('Ningbo Packaging Solutions', '宁波包装解决方案', 'Chen Hua', '+86 574 8901 2345', 'chenhua_nbpack', 'chenhua@nbpackaging.cn', 'Ningbo', 'Zhejiang', ARRAY['Packaging', 'Boxes', 'Labels'], '100% in advance', 'RMB', 4, 4, true, 52, 180000.00),
('Foshan Hardware Factory', '佛山五金厂', 'Li Qiang', '+86 757 8234 5678', 'liqiang_fshw', 'liqiang@fshardware.com', 'Foshan', 'Guangdong', ARRAY['Hardware', 'Tools', 'Metal Products'], '30% deposit, 70% before shipment', 'RMB', 5, 5, true, 38, 420000.00);

-- ============================================
-- 3. TEST PRODUCTS (15 records)
-- ============================================

INSERT INTO products (sku, product_name, product_name_cn, description, category, unit_price_rmb, unit_price_eur, unit_price_usd, default_markup_percent, qty_per_box, supplier_id, supplier_name, stock_quantity, is_active, is_featured) VALUES
('SKU-HOME-001', 'Bamboo Storage Box Set', '竹制收纳盒套装', '3-piece bamboo storage box with lids, eco-friendly', 'Home & Garden', 45.00, 6.50, 7.00, 85.00, 24, (SELECT id FROM suppliers WHERE supplier_name = 'Yiwu Best Manufacturing'), 'Yiwu Best Manufacturing', 500, true, true),
('SKU-HOME-002', 'Kitchen Organizer Rack', '厨房整理架', 'Stainless steel multi-tier kitchen organizer', 'Kitchen Supplies', 68.00, 9.80, 10.50, 75.00, 12, (SELECT id FROM suppliers WHERE supplier_name = 'Yiwu Best Manufacturing'), 'Yiwu Best Manufacturing', 300, true, true),
('SKU-TECH-001', 'Smart LED Light Bulb', '智能LED灯泡', 'WiFi-enabled RGB smart bulb with app control', 'Electronics', 35.00, 5.00, 5.50, 120.00, 50, (SELECT id FROM suppliers WHERE supplier_name = 'Shenzhen Tech Products'), 'Shenzhen Tech Products', 1000, true, true),
('SKU-TECH-002', 'Wireless Phone Charger', '无线手机充电器', '15W fast wireless charging pad', 'Electronics', 55.00, 7.90, 8.50, 95.00, 40, (SELECT id FROM suppliers WHERE supplier_name = 'Shenzhen Tech Products'), 'Shenzhen Tech Products', 800, true, false),
('SKU-TEXT-001', 'Cotton Bed Sheet Set', '棉床单套装', 'Premium 100% cotton bed sheet set, queen size', 'Textiles', 120.00, 17.00, 18.50, 65.00, 10, (SELECT id FROM suppliers WHERE supplier_name = 'Guangzhou Quality Textiles'), 'Guangzhou Quality Textiles', 200, true, true),
('SKU-TEXT-002', 'Microfiber Towel Set', '超细纤维毛巾套装', '6-piece ultra-soft microfiber towel set', 'Home Textiles', 80.00, 11.50, 12.50, 70.00, 20, (SELECT id FROM suppliers WHERE supplier_name = 'Guangzhou Quality Textiles'), 'Guangzhou Quality Textiles', 350, true, false),
('SKU-PACK-001', 'Custom Gift Box', '定制礼品盒', 'Premium cardboard gift box with custom printing', 'Packaging', 8.00, 1.15, 1.25, 150.00, 200, (SELECT id FROM suppliers WHERE supplier_name = 'Ningbo Packaging Solutions'), 'Ningbo Packaging Solutions', 5000, true, false),
('SKU-PACK-002', 'Eco Shipping Box', '环保运输箱', 'Recyclable corrugated shipping box, medium size', 'Packaging', 5.50, 0.80, 0.85, 140.00, 250, (SELECT id FROM suppliers WHERE supplier_name = 'Ningbo Packaging Solutions'), 'Ningbo Packaging Solutions', 8000, true, false),
('SKU-HARD-001', 'Multi-tool Set', '多功能工具套装', '18-piece professional tool set with case', 'Hardware', 150.00, 21.50, 23.00, 60.00, 6, (SELECT id FROM suppliers WHERE supplier_name = 'Foshan Hardware Factory'), 'Foshan Hardware Factory', 150, true, true),
('SKU-HARD-002', 'Door Handle Set', '门把手套装', 'Stainless steel modern door handle with lock', 'Hardware', 95.00, 13.50, 14.50, 65.00, 20, (SELECT id FROM suppliers WHERE supplier_name = 'Foshan Hardware Factory'), 'Foshan Hardware Factory', 400, true, false),
('SKU-HOME-003', 'Ceramic Flower Vase', '陶瓷花瓶', 'Handmade ceramic vase with modern design', 'Home & Garden', 42.00, 6.00, 6.50, 90.00, 36, (SELECT id FROM suppliers WHERE supplier_name = 'Yiwu Best Manufacturing'), 'Yiwu Best Manufacturing', 600, true, true),
('SKU-TECH-003', 'Bluetooth Speaker', '蓝牙音箱', 'Portable waterproof Bluetooth speaker', 'Electronics', 88.00, 12.50, 13.50, 85.00, 30, (SELECT id FROM suppliers WHERE supplier_name = 'Shenzhen Tech Products'), 'Shenzhen Tech Products', 500, true, true),
('SKU-TEXT-003', 'Cushion Cover Set', '靠垫套装', '4-piece decorative cushion covers, linen blend', 'Home Textiles', 60.00, 8.60, 9.30, 75.00, 40, (SELECT id FROM suppliers WHERE supplier_name = 'Guangzhou Quality Textiles'), 'Guangzhou Quality Textiles', 700, true, false),
('SKU-HOME-004', 'Wall Clock Modern', '现代挂钟', 'Silent quartz wall clock, minimalist design', 'Home & Garden', 58.00, 8.30, 9.00, 80.00, 24, (SELECT id FROM suppliers WHERE supplier_name = 'Yiwu Best Manufacturing'), 'Yiwu Best Manufacturing', 400, true, false),
('SKU-TECH-004', 'USB Hub 7-Port', '7口USB集线器', 'Powered USB 3.0 hub with individual switches', 'Electronics', 48.00, 6.90, 7.40, 100.00, 50, (SELECT id FROM suppliers WHERE supplier_name = 'Shenzhen Tech Products'), 'Shenzhen Tech Products', 900, true, false);

-- ============================================
-- 4. TEST STAFF MEMBERS (5 records)
-- ============================================

INSERT INTO staff_members (name, role, office_location, monthly_salary_rmb, monthly_salary_eur, skills, capacity_hours_per_week, active, hourly_rate_rmb, productivity_rate) VALUES
('Lily Chen', 'Sales Manager', 'Shenzhen', 18500.00, 2400.00, ARRAY['Sales', 'Client Relations', 'Negotiation', 'English', 'Mandarin'], 40, true, 115.00, 1.2),
('Peng Wang', 'Operations Manager', 'Yiwu', 12000.00, 1550.00, ARRAY['Operations', 'Logistics', 'Quality Control', 'Mandarin'], 40, true, 75.00, 1.0),
('Ruby Zhang', 'Sourcing Specialist', 'Shenzhen', 8500.00, 1100.00, ARRAY['Sourcing', 'Supplier Relations', 'Product Research', 'Mandarin'], 40, true, 53.00, 0.95),
('Lin Yi', 'Warehouse Supervisor', 'Yiwu', 7000.00, 900.00, ARRAY['Warehouse Management', 'Quality Inspection', 'Inventory', 'Mandarin'], 40, true, 44.00, 1.0),
('James Liu', 'Financial Assistant', 'Yiwu', 5000.00, 650.00, ARRAY['Accounting', 'Banking', 'Documentation', 'Mandarin'], 40, true, 31.00, 1.0);

-- ============================================
-- 5. TEST INVOICES (5 records)
-- ============================================

INSERT INTO invoices (
    invoice_number, 
    invoice_type, 
    customer_id, 
    customer_code, 
    customer_name, 
    invoice_date, 
    due_date, 
    currency, 
    grand_total, 
    status,
    items
) VALUES
(
    'INV-2025-001',
    'commercial',
    (SELECT id FROM customers WHERE customer_code = 'CUST001'),
    'CUST001',
    'John Smith',
    '2025-01-15',
    '2025-02-14',
    'EUR',
    2850.00,
    'paid',
    '[
        {"product_name": "Bamboo Storage Box Set", "quantity": 100, "unit_price": 12.03, "total": 1203.00},
        {"product_name": "Kitchen Organizer Rack", "quantity": 96, "unit_price": 17.15, "total": 1647.00}
    ]'::jsonb
),
(
    'INV-2025-002',
    'proforma',
    (SELECT id FROM customers WHERE customer_code = 'CUST003'),
    'CUST003',
    'Hans Mueller',
    '2025-01-18',
    '2025-02-17',
    'EUR',
    5200.00,
    'pending',
    '[
        {"product_name": "Smart LED Light Bulb", "quantity": 500, "unit_price": 11.00, "total": 5500.00},
        {"product_name": "Cotton Bed Sheet Set", "quantity": -10, "unit_price": 28.05, "total": -280.50, "note": "Sample discount"}
    ]'::jsonb
),
(
    'INV-2025-003',
    'commercial',
    (SELECT id FROM customers WHERE customer_code = 'CUST011'),
    'CUST011',
    'Sarah Johnson',
    '2025-01-20',
    '2025-02-19',
    'EUR',
    8950.00,
    'paid',
    '[
        {"product_name": "Multi-tool Set", "quantity": 200, "unit_price": 34.40, "total": 6880.00},
        {"product_name": "Bluetooth Speaker", "quantity": 100, "unit_price": 23.13, "total": 2313.00},
        {"product_name": "Shipping & Handling", "quantity": 1, "unit_price": -243.00, "total": -243.00}
    ]'::jsonb
),
(
    'QUO-2025-004',
    'quotation',
    (SELECT id FROM customers WHERE customer_code = 'CUST007'),
    'CUST007',
    'Petros Dimitriou',
    '2025-01-22',
    NULL,
    'EUR',
    3420.00,
    'draft',
    '[
        {"product_name": "Ceramic Flower Vase", "quantity": 300, "unit_price": 11.40, "total": 3420.00}
    ]'::jsonb
),
(
    'INV-2025-005',
    'commercial',
    (SELECT id FROM customers WHERE customer_code = 'CUST015'),
    'CUST015',
    'Anastasia Volkov',
    '2025-01-25',
    '2025-02-24',
    'EUR',
    6780.00,
    'partial',
    '[
        {"product_name": "Microfiber Towel Set", "quantity": 400, "unit_price": 19.55, "total": 7820.00},
        {"product_name": "Volume Discount", "quantity": 1, "unit_price": -1040.00, "total": -1040.00}
    ]'::jsonb
);

-- ============================================
-- 6. TEST ORDERS (3 records)
-- ============================================

INSERT INTO orders (
    order_number,
    customer_code,
    client_name,
    product_description,
    quantity,
    total_value,
    currency,
    order_date,
    delivery_date,
    status,
    priority,
    assigned_office
) VALUES
(
    'ORD-2025-001',
    'CUST001',
    'John Smith - Smith Trading Ltd',
    'Bamboo Storage Box Set (100 pcs) + Kitchen Organizer Rack (96 pcs)',
    196,
    2850.00,
    'EUR',
    '2025-01-15',
    '2025-03-01',
    'in_production',
    'high',
    'Yiwu'
),
(
    'ORD-2025-002',
    'CUST011',
    'Sarah Johnson - Johnson Enterprises',
    'Multi-tool Set (200 pcs) + Bluetooth Speaker (100 pcs)',
    300,
    8950.00,
    'EUR',
    '2025-01-20',
    '2025-03-10',
    'confirmed',
    'high',
    'Shenzhen'
),
(
    'ORD-2025-003',
    'CUST007',
    'Petros Dimitriou - Dimitriou Bros',
    'Ceramic Flower Vase (300 pcs)',
    300,
    3420.00,
    'EUR',
    '2025-01-22',
    '2025-03-15',
    'pending',
    'medium',
    'Yiwu'
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Test data created successfully!';
    RAISE NOTICE '📊 Created:';
    RAISE NOTICE '   - 20 Customers';
    RAISE NOTICE '   - 5 Suppliers';
    RAISE NOTICE '   - 15 Products';
    RAISE NOTICE '   - 5 Staff Members';
    RAISE NOTICE '   - 5 Invoices';
    RAISE NOTICE '   - 3 Orders';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Database is now ready for testing!';
END $$;
