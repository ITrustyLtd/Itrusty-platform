/**
 * I Trusty CRM - Automatic Data Initialization
 * This script runs automatically when the application loads
 * and initializes example data if the database is empty.
 */

(async function autoInitialize() {
    console.log('🔍 Checking if data initialization is needed...');
    
    try {
        // Check if staff members exist
        const staffResponse = await fetch('tables/staff_members?limit=1');
        const staffData = await staffResponse.json();
        
        // If data already exists, skip initialization
        if (staffData.data && staffData.data.length > 0) {
            console.log('✅ Data already initialized. Skipping...');
            return;
        }
        
        console.log('📦 Initializing example data...');
        
        // ===== 1. Initialize Staff Members =====
        const teamMembers = [
            {"name": "Peng", "role": "Manager", "office_location": "Yiwu", "monthly_salary_rmb": 12000, "monthly_salary_eur": 0, "capacity_hours_per_week": 48, "skills": ["Management", "Sourcing", "QC"], "active": true},
            {"name": "Zheng (Big Brother)", "role": "QC Inspector", "office_location": "Yiwu", "monthly_salary_rmb": 6000, "monthly_salary_eur": 0, "capacity_hours_per_week": 45, "skills": ["Quality Control", "Inspection"], "active": true},
            {"name": "Lin Yi", "role": "QC & Warehouse", "office_location": "Yiwu", "monthly_salary_rmb": 7000, "monthly_salary_eur": 0, "capacity_hours_per_week": 45, "skills": ["Quality Control", "Warehouse Management"], "active": true},
            {"name": "James", "role": "Finance", "office_location": "Yiwu", "monthly_salary_rmb": 5000, "monthly_salary_eur": 0, "capacity_hours_per_week": 40, "skills": ["Banking", "Finance", "Payments"], "active": true},
            {"name": "Lily", "role": "Manager", "office_location": "Shenzhen", "monthly_salary_rmb": 18500, "monthly_salary_eur": 0, "capacity_hours_per_week": 50, "skills": ["Management", "Sourcing", "Client Relations"], "active": true},
            {"name": "Ruby", "role": "Purchasing", "office_location": "Shenzhen", "monthly_salary_rmb": 8500, "monthly_salary_eur": 0, "capacity_hours_per_week": 48, "skills": ["Purchasing", "Supplier Relations"], "active": true},
            {"name": "Xiao Min", "role": "Sourcing", "office_location": "Shenzhen", "monthly_salary_rmb": 6500, "monthly_salary_eur": 0, "capacity_hours_per_week": 45, "skills": ["Product Sourcing", "Research"], "active": true},
            {"name": "Silent Artist", "role": "Designer", "office_location": "Shenzhen", "monthly_salary_rmb": 7000, "monthly_salary_eur": 0, "capacity_hours_per_week": 40, "skills": ["Graphic Design", "Packaging Design"], "active": true},
            {"name": "Johny (CEO)", "role": "CEO", "office_location": "Shenzhen", "monthly_salary_rmb": 0, "monthly_salary_eur": 0, "capacity_hours_per_week": 60, "skills": ["Strategy", "Management", "Business Development"], "active": true},
            {"name": "Nikos", "role": "Operations Greece", "office_location": "Greece", "monthly_salary_rmb": 10760, "monthly_salary_eur": 1230, "capacity_hours_per_week": 40, "skills": ["Operations", "Client Relations", "Logistics"], "active": true},
            {"name": "Chrysanthi", "role": "Admin Greece", "office_location": "Greece", "monthly_salary_rmb": 6565, "monthly_salary_eur": 750, "capacity_hours_per_week": 35, "skills": ["Administration", "Data Entry", "Documentation"], "active": true}
        ];
        
        console.log('👥 Adding 11 team members...');
        for (const member of teamMembers) {
            await fetch('tables/staff_members', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(member)
            });
        }
        
        // ===== 2. Initialize Financial Accounts =====
        const financialAccounts = [
            {"account_name": "CCB RMB", "account_type": "Current Account", "currency": "CNY", "balance": 2044786.18, "bank_name": "China Construction Bank", "account_number": "***6789", "location": "China", "active": true},
            {"account_name": "CCB EUR", "account_type": "Current Account", "currency": "EUR", "balance": 177824.68, "bank_name": "China Construction Bank", "account_number": "***1234", "location": "China", "active": true},
            {"account_name": "RAPYD EUR", "account_type": "Current Account", "currency": "EUR", "balance": 72232.77, "bank_name": "RAPYD", "account_number": "***4567", "location": "UK", "active": true},
            {"account_name": "MANA", "account_type": "Current Account", "currency": "EUR", "balance": 99400.00, "bank_name": "MANA", "account_number": "***7890", "location": "Cyprus", "active": true},
            {"account_name": "N26", "account_type": "Current Account", "currency": "EUR", "balance": 12634.84, "bank_name": "N26", "account_number": "***2345", "location": "Germany", "active": true},
            {"account_name": "Saving 5 years", "account_type": "Saving Account", "currency": "CNY", "balance": 250000.00, "bank_name": "China Construction Bank", "account_number": "***5678", "location": "China", "active": true},
            {"account_name": "Saving 3 years", "account_type": "Saving Account", "currency": "CNY", "balance": 150000.00, "bank_name": "China Construction Bank", "account_number": "***6789", "location": "China", "active": true},
            {"account_name": "Johny Cash RMB", "account_type": "Cash", "currency": "CNY", "balance": 2500.00, "bank_name": "N/A", "account_number": "N/A", "location": "Shenzhen Office", "active": true},
            {"account_name": "Johny Cash EUR", "account_type": "Cash", "currency": "EUR", "balance": 850.00, "bank_name": "N/A", "account_number": "N/A", "location": "Shenzhen Office", "active": true},
            {"account_name": "Peng Cash RMB", "account_type": "Cash", "currency": "CNY", "balance": 1500.00, "bank_name": "N/A", "account_number": "N/A", "location": "Yiwu Office", "active": true},
            {"account_name": "Lily Cash RMB", "account_type": "Cash", "currency": "CNY", "balance": 1200.00, "bank_name": "N/A", "account_number": "N/A", "location": "Shenzhen Office", "active": true},
            {"account_name": "ICBC RMB", "account_type": "Current Account", "currency": "CNY", "balance": 156000.00, "bank_name": "ICBC", "account_number": "***3456", "location": "China", "active": true},
            {"account_name": "BOC USD", "account_type": "Current Account", "currency": "USD", "balance": 45000.00, "bank_name": "Bank of China", "account_number": "***7891", "location": "China", "active": true},
            {"account_name": "Alipay Business", "account_type": "Current Account", "currency": "CNY", "balance": 89000.00, "bank_name": "Alipay", "account_number": "***1122", "location": "China", "active": true},
            {"account_name": "WeChat Pay Business", "account_type": "Current Account", "currency": "CNY", "balance": 67000.00, "bank_name": "WeChat Pay", "account_number": "***3344", "location": "China", "active": true},
            {"account_name": "Piraeus EUR", "account_type": "Current Account", "currency": "EUR", "balance": 23400.00, "bank_name": "Piraeus Bank", "account_number": "***5566", "location": "Greece", "active": true},
            {"account_name": "Alpha EUR", "account_type": "Current Account", "currency": "EUR", "balance": 18900.00, "bank_name": "Alpha Bank", "account_number": "***7788", "location": "Greece", "active": true},
            {"account_name": "Nikos Cash EUR", "account_type": "Cash", "currency": "EUR", "balance": 450.00, "bank_name": "N/A", "account_number": "N/A", "location": "Greece Office", "active": true},
            {"account_name": "Payoneer USD", "account_type": "Current Account", "currency": "USD", "balance": 12500.00, "bank_name": "Payoneer", "account_number": "***9900", "location": "USA", "active": true},
            {"account_name": "Wise Multi-Currency", "account_type": "Current Account", "currency": "EUR", "balance": 34000.00, "bank_name": "Wise", "account_number": "***1122", "location": "UK", "active": true},
            {"account_name": "Revolut Business", "account_type": "Current Account", "currency": "EUR", "balance": 28000.00, "bank_name": "Revolut", "account_number": "***3344", "location": "UK", "active": true},
            {"account_name": "Petty Cash Yiwu", "account_type": "Cash", "currency": "CNY", "balance": 800.00, "bank_name": "N/A", "account_number": "N/A", "location": "Yiwu Office", "active": true},
            {"account_name": "Petty Cash Shenzhen", "account_type": "Cash", "currency": "CNY", "balance": 1000.00, "bank_name": "N/A", "account_number": "N/A", "location": "Shenzhen Office", "active": true},
            {"account_name": "Emergency Fund", "account_type": "Saving Account", "currency": "EUR", "balance": 50000.00, "bank_name": "N26", "account_number": "***5566", "location": "Germany", "active": true}
        ];
        
        console.log('💰 Adding 24 financial accounts...');
        for (const account of financialAccounts) {
            await fetch('tables/financial_accounts', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(account)
            });
        }
        
        // ===== 3. Initialize Sample Transfers =====
        const sampleTransfers = [
            {
                "from_account": "CCB RMB",
                "to_account": "CCB EUR",
                "from_currency": "CNY",
                "to_currency": "EUR",
                "from_amount": 78500.00,
                "fx_rate": 0.127,
                "to_amount": 9969.50,
                "transfer_date": "2025-01-15",
                "notes": "Monthly EUR conversion for supplier payments",
                "transfer_type": "currency_exchange"
            },
            {
                "from_account": "RAPYD EUR",
                "to_account": "Lily Cash RMB",
                "from_currency": "EUR",
                "to_currency": "CNY",
                "from_amount": 5000.00,
                "fx_rate": 7.85,
                "to_amount": 39250.00,
                "transfer_date": "2025-01-20",
                "notes": "Cash advance for Shenzhen operations",
                "transfer_type": "internal_transfer"
            },
            {
                "from_account": "CCB EUR",
                "to_account": "MANA",
                "from_currency": "EUR",
                "to_currency": "EUR",
                "from_amount": 25000.00,
                "fx_rate": 1.0,
                "to_amount": 25000.00,
                "transfer_date": "2025-02-01",
                "notes": "Transfer to Cyprus account for EU operations",
                "transfer_type": "internal_transfer"
            }
        ];
        
        console.log('💸 Adding 3 example transfers...');
        for (const transfer of sampleTransfers) {
            await fetch('tables/account_transfers', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(transfer)
            });
        }
        
        // ===== 4. Initialize Customers =====
        const customers = [
            {"customer_code": "GST", "customer_name": "Global Sat", "country": "Greece", "active": true},
            {"customer_code": "SRP", "customer_name": "SRP Hotel Equipment", "country": "Greece", "active": true},
            {"customer_code": "AMD", "customer_name": "AMD Electronics", "country": "Greece", "active": true},
            {"customer_code": "CTC", "customer_name": "CTC Hotels", "country": "Greece", "active": true},
            {"customer_code": "IRED", "customer_name": "IRED Trading", "country": "Cyprus", "active": true},
            {"customer_code": "AGL", "customer_name": "AGL Supplies", "country": "Greece", "active": true},
            {"customer_code": "AGR", "customer_name": "AGR Group", "country": "Greece", "active": true},
            {"customer_code": "AKRT", "customer_name": "AKRT Industries", "country": "Cyprus", "active": true},
            {"customer_code": "ALC", "customer_name": "ALC Trading", "country": "Greece", "active": true},
            {"customer_code": "ARX", "customer_name": "ARX Exports", "country": "Greece", "active": true},
            {"customer_code": "AVG", "customer_name": "AVG Corporation", "country": "Greece", "active": true},
            {"customer_code": "AVS", "customer_name": "AVS Services", "country": "Cyprus", "active": true},
            {"customer_code": "BDS", "customer_name": "BDS Holdings", "country": "Greece", "active": true},
            {"customer_code": "BRS", "customer_name": "BRS International", "country": "Greece", "active": true},
            {"customer_code": "BSK", "customer_name": "BSK Ventures", "country": "Cyprus", "active": true},
            {"customer_code": "CCC", "customer_name": "CCC Imports", "country": "Greece", "active": true},
            {"customer_code": "CLCT", "customer_name": "CLCT Group", "country": "Greece", "active": true},
            {"customer_code": "CHS", "customer_name": "CHS Trading", "country": "Cyprus", "active": true},
            {"customer_code": "DML", "customer_name": "DML Enterprises", "country": "Greece", "active": true},
            {"customer_code": "EXM", "customer_name": "EXM Global", "country": "Greece", "active": true},
            {"customer_code": "GRD", "customer_name": "GRD Partners", "country": "Greece", "active": true},
            {"customer_code": "GSS", "customer_name": "GSS Solutions", "country": "Cyprus", "active": true},
            {"customer_code": "IMAR", "customer_name": "IMAR Trading", "country": "Greece", "active": true},
            {"customer_code": "KLO", "customer_name": "KLO Industries", "country": "Greece", "active": true},
            {"customer_code": "KRG", "customer_name": "KRG Group", "country": "Cyprus", "active": true},
            {"customer_code": "KTS", "customer_name": "KTS Exports", "country": "Greece", "active": true},
            {"customer_code": "MAP", "customer_name": "MAP Corporation", "country": "Greece", "active": true},
            {"customer_code": "MST", "customer_name": "MST Holdings", "country": "Cyprus", "active": true},
            {"customer_code": "NEDEL", "customer_name": "NEDEL Services", "country": "Greece", "active": true},
            {"customer_code": "PMS", "customer_name": "PMS International", "country": "Greece", "active": true},
            {"customer_code": "PVL", "customer_name": "PVL Trading", "country": "Cyprus", "active": true},
            {"customer_code": "RAA", "customer_name": "RAA Ventures", "country": "Greece", "active": true},
            {"customer_code": "SBS", "customer_name": "SBS Group", "country": "Greece", "active": true},
            {"customer_code": "SME", "customer_name": "SME Enterprises", "country": "Cyprus", "active": true},
            {"customer_code": "VES", "customer_name": "VES Partners", "country": "Greece", "active": true},
            {"customer_code": "VVS", "customer_name": "VVS Solutions", "country": "Greece", "active": true},
            {"customer_code": "XAR", "customer_name": "XAR Industries", "country": "Cyprus", "active": true},
            {"customer_code": "TEO", "customer_name": "TEO Trading", "country": "Greece", "active": true},
            {"customer_code": "TSN", "customer_name": "TSN Group", "country": "Greece", "active": true},
            {"customer_code": "DAM", "customer_name": "DAM Exports", "country": "Cyprus", "active": true},
            {"customer_code": "DTR", "customer_name": "DTR Corporation", "country": "Greece", "active": true}
        ];
        
        console.log('👔 Adding 41 customers...');
        for (const customer of customers) {
            await fetch('tables/customers', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(customer)
            });
        }
        
        console.log('✅ Data initialization completed successfully!');
        console.log('📊 Summary:');
        console.log('  - 11 team members added');
        console.log('  - 24 financial accounts added');
        console.log('  - 3 sample transfers added');
        console.log('  - 41 customers added');
        
    } catch (error) {
        console.error('❌ Error during data initialization:', error);
    }
})();
