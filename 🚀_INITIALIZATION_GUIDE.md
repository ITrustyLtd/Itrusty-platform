# 🚀 System Initialization - Quick Start Guide

## ✨ Welcome to I Trusty Ltd Platform v5.0!

This guide will help you initialize your system with complete business data in **under 2 minutes**!

---

## 🎯 What You'll Get

After initialization, your system will have:

### 👥 **11 Staff Members**
- **Yiwu Office**: Peng (Manager), Big Brother (QC), Lin Yi (Warehouse), James (Banking)
- **Shenzhen Office**: Lily (Sales Manager), Ruby (Sourcing), Xiao Min (Research), Silent Artist (Designer)
- **Greece Office**: Nikos (Admin), Chrysanthi (Records)
- **CEO**: Johny Vlachopoulos

### 🔐 **7 User Accounts** (Login Ready)
```
johny       / admin123      → Full Admin Access
lily        / lily123       → Sales Manager (Shenzhen)
peng        / peng123       → Operations Manager (Yiwu)
ruby        / ruby123       → Staff (Customer-restricted: SRP, CTC, IRED, AMD)
bigbrother  / bb123         → Staff (QC)
nikos       / nikos123      → Read-only (Greece)
chrysanthi  / chrys123      → Read-only (Greece)
```

### 🏢 **10 Customers**
| Code | Name | Country | Contact |
|------|------|---------|---------|
| SRP | SRP Hotel Supplies | Greece | Mr. Smith |
| CTC | CTC Ceramics | UK | Mrs. Johnson |
| IRED | IRED Electronics | Germany | Mr. Müller |
| AMD | AMD Distributors | USA | Mr. Anderson |
| GLB | Global Sat | Greece | Mr. Dimitriou |
| ARX | Archangelos Imports | Greece | Fr. Michael |
| MON | Mondsub | Germany | Mr. Schmidt |
| DIM | Dimitriou Bros | Greece | Petros |
| SIL | Siluan Project | China | Johny |
| TST | Test Customer | TestLand | John Doe |

### 🏦 **6 Bank Accounts**
| Bank | Currency | Balance |
|------|----------|---------|
| CCB Yiwu Main | RMB | ¥250,000 |
| HSBC Hong Kong | HKD | HK$150,000 |
| HSBC Hong Kong USD | USD | $25,000 |
| Piraeus Bank Greece | EUR | €35,000 |
| WeChat Pay | RMB | ¥50,000 |
| Alipay | RMB | ¥30,000 |

### 📦 **15 Products**
- **Siluan Orthodox**: Byzantine Icons, Prayer Ropes, Incense Burners, Olive Wood Crosses
- **Hotel Supplies**: Towel Sets, Bed Sheets, Disposable Slippers
- **Electronics**: LED Bulbs, USB Cables, Power Banks
- **Ceramics**: Flower Vases, Dinner Plate Sets
- **Miscellaneous**: Bamboo Cutting Boards, Water Bottles, Tote Bags

### 📄 **10 Invoices**
- **3 Quotations**: QUO-20250501-SRP-001, QUO-20250503-CTC-001, QUO-20250505-SIL-001
- **4 Pro Forma**: PFI-20250506-SRP-002, PFI-20250508-IRED-001, PFI-20250510-AMD-001, PFI-20250512-GLB-001
- **3 Commercial**: CIV-20250514-SRP-003, CIV-20250515-IRED-002, CIV-20250516-AMD-002

### 📦 **12 Orders**
With various statuses: Pending, In Production, Quality Check, Shipped, In Transit, Completed

### 💰 **6 Sales Commissions**
- **Lily Chen**: 4 commissions (€5,852.50, €7,720, €13,050, €1,038.50)
- **Ruby Zhang**: 2 commissions (€7,300, €1,524)

### 💸 **7 Company Expenses**
- Office rents (Shenzhen, Yiwu)
- Utilities (Electricity, Internet)
- Transportation costs

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Initialization Page**
```
File: initialize-system-data.html
```
- Double-click the file, or
- Open in your browser from the project folder

### **Step 2: Review What Will Be Created**
Scroll down to see the complete list of data that will be initialized.

### **Step 3: Click "Start Initialization"**
- Large purple button at the top
- Watch the real-time progress bars
- Activity log shows each record being created

### **Step 4: Wait for Completion**
- Takes approximately 30-60 seconds
- Overall progress bar shows total completion
- Each category shows individual progress

### **Step 5: Success! 🎉**
When you see:
```
✅ INITIALIZATION COMPLETE!
🎉 All data has been successfully created!
💡 Refresh any page to see the new data.
```

### **Step 6: Test Your System**
Refresh any page to see live data:

#### **Dashboard** (`index.html`)
- See 11 staff members (not 0!)
- See 10 customers
- See 12 active orders
- Real bank balances

#### **Staff Dashboard** (`staff-dashboard.html`)
- All 11 team members listed
- Accurate salaries displayed
- Office locations shown

#### **Login** (`login.html`)
- Try any of the 7 user accounts
- Each has different permissions
- Ruby sees only her 4 customers!

#### **Invoices History** (`invoices-history.html`)
- See 10 sample invoices
- Filter by type, status, customer
- Real amounts and dates

#### **Products Library** (`products-library.html`)
- Browse 15 products
- SKU codes, prices, suppliers
- Product images (if URLs provided)

#### **Customers** (`customers.html`)
- View 10 customers
- Contact information
- Order history

#### **Sales Commissions** (`sales-commissions.html`)
- 6 commission records
- Linked to invoices
- Real profit calculations

---

## 🔄 Re-Initialization

If you want to **start fresh**:

### ⚠️ Warning: This will delete all data!

1. Open initialization page
2. Click "Clear All Data" (red button)
3. Confirm twice (safety check)
4. Wait for cleanup
5. Click "Start Initialization" again

---

## 🧪 Testing Scenarios

### **Scenario 1: Admin Full Access**
```
Login: johny / admin123
Test: View all pages, edit everything
Expected: Full access to all data and functions
```

### **Scenario 2: Manager Access**
```
Login: lily / lily123
Test: View sales commissions, create invoices
Expected: Full operational access
```

### **Scenario 3: Customer-Restricted Access**
```
Login: ruby / ruby123
Test: View customers page
Expected: See ONLY SRP, CTC, IRED, AMD (not other 6 customers!)
```

### **Scenario 4: Read-Only Access**
```
Login: nikos / nikos123
Test: View pages, try to edit
Expected: Can view, cannot edit/delete
```

---

## 📊 Data Relationships

```
CUSTOMERS (10)
    ↓
INVOICES (10)
    ├─ Items → PRODUCTS (15)
    ├─ Creates → ORDERS (12)
    └─ Generates → COMMISSIONS (6)
    
STAFF (11)
    ↓
USERS (7)
    └─ Login credentials
    
BANK ACCOUNTS (6)
    ↓
EXPENSES (7)
    └─ Payment records
```

---

## ✅ Success Checklist

After initialization, verify:

- [ ] **Dashboard shows real numbers** (not 0%)
- [ ] **Can login with any of 7 accounts**
- [ ] **Customers page shows 10 clients**
- [ ] **Staff dashboard shows 11 members**
- [ ] **Products library shows 15 items**
- [ ] **Invoices history shows 10 documents**
- [ ] **Orders page shows 12 orders**
- [ ] **Sales commissions shows 6 records**
- [ ] **Bank accounts shows 6 accounts**
- [ ] **Ruby sees only 4 customers** (SRP, CTC, IRED, AMD)

---

## 🆘 Troubleshooting

### **Problem: Progress bar stuck at 0%**
**Solution**: Check browser console (F12) for errors, refresh page and try again

### **Problem: "Failed to create X" errors in log**
**Solution**: Check that no data exists already, or use "Clear All Data" first

### **Problem: Dashboard still shows 0% after initialization**
**Solution**: Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)

### **Problem: Cannot login with created accounts**
**Solution**: Verify user accounts were created (check activity log), try "johny / admin123" first

---

## 🎊 You're Ready!

Your I Trusty Ltd platform is now **fully initialized** with realistic business data!

**Next Steps:**
1. Explore all pages
2. Test different user roles
3. Try creating new records
4. Customize data as needed
5. Start using for real business!

**Need Help?**
- Check README.md for full documentation
- Review individual page guides
- Contact system administrator

---

**Built with ❤️ for I Trusty Ltd**

*"From zero to hero in 60 seconds!"* 🚀
