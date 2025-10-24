# 💼 Company Expenses & Payroll Management System

## 🎯 **OVERVIEW**

Complete expense management system for tracking **ALL company operational costs**:
- ✅ **Monthly Payroll** (11 staff members across 3 offices)
- ✅ **Office Rent** (Yiwu: ¥70,000/year, Shenzhen: ¥132,000/year)
- ✅ **Samples** (non-billable R&D costs)
- ✅ **Entertainment** (customer dinners, relationship building)
- ✅ **Utilities, Travel, Marketing, Supplies** (all operational expenses)
- ✅ **Recurring Payment Templates** (auto-schedule monthly/yearly payments)
- ✅ **Bank Account Integration** (same accounts as customer/supplier transactions)

---

## 🚀 **KEY FEATURES**

### **1. Expense Categories**
Track expenses across 11 categories:
1. **Payroll** - Staff salaries (11 employees)
2. **Office Rent** - Warehouse & office rent (Yiwu, Shenzhen)
3. **Samples** - Non-billable product samples for customers
4. **Entertainment** - Customer dinners, relationship building
5. **Utilities** - Electricity, water, internet
6. **Travel** - Business trips, transportation
7. **Marketing** - Advertising, promotions
8. **Supplies** - Office supplies, equipment
9. **Professional Services** - Legal, accounting, consulting
10. **Insurance** - Business insurance
11. **Other** - Miscellaneous expenses

### **2. Recurring Payments**
Set up **automatic recurring expenses**:
- **Monthly**: Salaries (e.g., Peng ¥12,000/month on 30th, Ruby ¥6,500/month on 23rd)
- **Quarterly**: Quarterly insurance payments
- **Yearly**: Annual office rent (¥70,000 Yiwu, ¥132,000 Shenzhen)

**Recurring Day Feature**:
- Set specific day of month (e.g., 23rd for Ruby, 30th for everyone else)
- System tracks next payment date automatically
- Visual indicator shows recurring vs one-time payments

### **3. Bank Account Integration**
✅ **Integrated with Financial Management**:
- Uses same 25+ real accounts (REVOLUTE, CCB RMB, N26, Alipay, Wechat, etc.)
- Track which account paid which expense
- Easy reconciliation with bank statements
- Multi-currency support (EUR, USD, RMB, GBP, HKD)

### **4. Multi-Office Tracking**
Track expenses by office location:
- **Yiwu Office**: Peng (¥12,000), Zheng (¥6,000), Lin Yi (¥5,000), James (¥5,000)
- **Shenzhen Office**: Lily (¥18,500), Ruby (¥6,500), Xiao Min (¥6,500), Silent Artist (¥7,000)
- **Greece Office**: Nikos (€1,230), Chrysanthi (€750)

### **5. Payment Status Tracking**
Track payment lifecycle:
- **Scheduled** (blue) - Future payment planned
- **Pending** (yellow) - Payment in process
- **Paid** (green) - Payment completed
- **Cancelled** (red) - Payment cancelled

### **6. Analytics & Reports**
**Dashboard Summary Cards**:
1. **Total Payroll**: Monthly salary total
2. **Office Rent**: Annual rent total
3. **Samples & R&D**: Non-billable product costs
4. **Entertainment**: Customer relationship expenses
5. **Other Expenses**: All other operational costs

**Visual Charts**:
1. **Expenses by Category** (Doughnut Chart)
2. **Expenses by Office** (Bar Chart)

### **7. Advanced Filtering**
Filter expenses by:
- **Category** (Payroll, Rent, Samples, Entertainment, etc.)
- **Office** (Yiwu, Shenzhen, Greece)
- **Status** (Paid, Pending, Scheduled, Cancelled)
- **Month** (Filter by specific month)
- **Search** (Search payee name, notes, category)

---

## 💼 **YOUR STAFF PAYROLL (Pre-loaded)**

### **Yiwu Office** (¥28,000/month total):
| Staff | Role | Salary | Payment Date | Bank Account |
|-------|------|--------|--------------|--------------|
| **Peng** | Yiwu Manager | ¥12,000 | 30th | CCB RMB |
| **Zheng (Big Brother)** | General Worker/QC | ¥6,000 | 30th | CCB RMB |
| **Lin Yi** | Warehouse/QC | ¥5,000 | 30th | CCB RMB |
| **James** | Banking Services | ¥5,000 | 30th | CCB RMB |

### **Shenzhen Office** (¥38,500/month total):
| Staff | Role | Salary | Payment Date | Bank Account |
|-------|------|--------|--------------|--------------|
| **Lily** | Shenzhen Manager | ¥18,500 | 30th | CCB RMB |
| **Ruby** | Procurement | ¥6,500 | **23rd** ⚠️ | Alipay |
| **Xiao Min** | Product Research | ¥6,500 | 30th | Wechat |
| **Silent Artist** | Graphic Designer | ¥7,000 | 30th | Wechat |

### **Greece Office** (€1,980/month total):
| Staff | Role | Salary | Payment Date | Bank Account |
|-------|------|--------|--------------|--------------|
| **Nikos** | Customer Communication | €1,230 | 30th | N26 |
| **Chrysanthi** | Google Sheets Management | €750 | 30th | N26 |

**Total Monthly Payroll**: ¥66,500 + €1,980

### **Office Rent** (Annual):
| Office | Property | Annual Rent | Payment Date | Bank Account |
|--------|----------|-------------|--------------|--------------|
| **Yiwu** | Two Warehouses | ¥70,000 | January 1st | CCB RMB |
| **Shenzhen** | Office Space | ¥132,000 | January 1st | CCB RMB |

**Total Annual Rent**: ¥202,000

---

## 🎨 **HOW TO USE**

### **Access the Page**:
1. **From Dashboard**: Click **"Company Expenses"** button (purple button, top section)
2. **Direct URL**: `company-expenses.html`
3. **From Financial Management**: Link available in Finance page

---

### **Add a New Expense**:

1. Click **"+ Add Expense"** button (purple, top right)

2. **Fill in Basic Details**:
   - **Category**: Select from dropdown (Payroll, Rent, Samples, Entertainment, etc.)
   - **Subcategory**: Detailed description (e.g., "Staff Salary", "Manager Salary")
   - **Expense Date**: Date of expense
   - **Payee**: Who receives the payment (staff name, vendor, etc.)
   - **Office**: Yiwu, Shenzhen, or Greece

3. **Payment Details**:
   - **Amount**: Enter amount
   - **Currency**: RMB, EUR, USD, GBP, or HKD
   - **Status**: Scheduled, Pending, Paid, or Cancelled
   - **Bank Account**: Select from your real accounts (dropdown populated from Financial Management)
   - **Payment Method**: Bank Transfer, Cash, Alipay, WeChat Pay, etc.

4. **Recurring Settings** (Optional):
   - ☑️ Check **"Recurring Expense"**
   - **Frequency**: Monthly, Quarterly, or Yearly
   - **Day of Month**: Enter day (e.g., 23 for Ruby, 30 for others)
   - System will track and remind you of next payment

5. **Additional Info**:
   - **Invoice Number**: Reference number (optional)
   - **Notes**: Additional details

6. Click **"Create Expense"**

---

### **Edit an Expense**:
1. Click on any row in the table
2. Modify fields as needed
3. Save changes

---

### **Delete an Expense**:
1. Click trash icon (🗑️) in Actions column
2. Confirm deletion
3. Expense removed from records

---

### **Filter Expenses**:
Use filter dropdowns at top:
- **Category**: Show only specific category
- **Office**: Show only specific office
- **Status**: Show only specific status
- **Month**: Show expenses for specific month
- **Search**: Search by payee name, notes, category

---

### **Export to Excel**:
1. Click **"Export"** button (green, top right)
2. Downloads CSV file with all filtered expenses
3. Open in Excel/Google Sheets for analysis

---

## 📊 **USE CASES**

### **Use Case 1: Monthly Payroll Processing**
**Scenario**: It's October 23rd, Ruby's payday

**Steps**:
1. Open Company Expenses page
2. Filter: **Category = "Payroll"**, **Office = "Shenzhen"**
3. Find Ruby's scheduled payment (¥6,500, Status: Scheduled)
4. Click to edit
5. Change **Status** to "Paid"
6. Save

**Result**: Ruby's payment marked as paid, ¥6,500 deducted from Alipay account balance

---

### **Use Case 2: Track Sample Costs**
**Scenario**: Sent ¥5,000 worth of samples to customer DAM for evaluation (non-billable)

**Steps**:
1. Click **"+ Add Expense"**
2. **Category**: Samples
3. **Subcategory**: Product Samples
4. **Payee**: DAM Customer
5. **Date**: Today
6. **Amount**: 5000
7. **Currency**: RMB
8. **Office**: Shenzhen
9. **Bank Account**: CCB RMB
10. **Status**: Paid
11. **Notes**: "Samples for DAM evaluation, not invoiced"
12. Click "Create Expense"

**Result**: Sample cost tracked as non-billable expense, visible in reports

---

### **Use Case 3: Customer Dinner Expense**
**Scenario**: Took important customer to dinner, spent €200

**Steps**:
1. Click **"+ Add Expense"**
2. **Category**: Entertainment
3. **Subcategory**: Customer Dinner
4. **Payee**: Restaurant Name
5. **Date**: Today
6. **Amount**: 200
7. **Currency**: EUR
8. **Office**: Greece (or where dinner happened)
9. **Bank Account**: N26
10. **Status**: Paid
11. **Notes**: "Dinner with [Customer Name] to discuss Q4 orders"
12. Click "Create Expense"

**Result**: Entertainment expense tracked, deducted from N26 account

---

### **Use Case 4: Monthly Report for Accountant**
**Scenario**: Need to send October expenses to accountant

**Steps**:
1. **Filter by Month**: Select "2025-10" in Month dropdown
2. Review all October expenses (payroll, samples, entertainment, etc.)
3. Click **"Export"** button
4. Download CSV file
5. Send to accountant

**Result**: Complete October expense report exported to Excel

---

### **Use Case 5: Office-Specific Cost Analysis**
**Scenario**: Want to see how much Shenzhen office costs per month

**Steps**:
1. **Filter by Office**: Select "Shenzhen"
2. **Filter by Month**: Select current month
3. View dashboard summary cards:
   - Total Payroll: ¥38,500 (Lily + Ruby + Xiao Min + Silent Artist)
   - Office Rent: ¥11,000 (¥132,000/12 months)
   - Other expenses: Samples, utilities, etc.

**Result**: Complete cost breakdown for Shenzhen office

---

## 🔄 **INTEGRATION WITH OTHER SYSTEMS**

### **1. Financial Management** (`finance.html`)
- ✅ Uses same bank accounts
- ✅ Expenses deducted from account balances
- ✅ Easy reconciliation
- ✅ Multi-currency tracking

### **2. Customer Transactions** (`transactions-customers.html`)
- Samples costs tracked separately (not invoiced to customers)
- Entertainment costs tracked separately (relationship building)

### **3. Supplier Payments** (`transactions-suppliers.html`)
- Company expenses = internal costs (payroll, rent)
- Supplier payments = external costs (product purchases)
- Both tracked separately for clear financial reporting

### **4. Profit Analysis** (`profit-analysis.html`)
- Company expenses factored into overall profitability
- Net Profit = Revenue - Supplier Costs - Company Expenses
- Clear visibility into operational efficiency

---

## 💡 **STRATEGIC INSIGHTS**

### **Why This System is Critical for I Trusty**:

#### **1. Complete Cost Visibility**
**Before**: Payroll, samples, entertainment mixed in with other transactions  
**After**: Clear categorization of ALL operational costs ✅

#### **2. Multi-Office Management**
**Before**: Difficult to track which office costs what  
**After**: Office-specific cost tracking (Yiwu vs Shenzhen vs Greece) ✅

#### **3. Recurring Payment Automation**
**Before**: Manual tracking of 11 salaries with different payment dates  
**After**: Automated recurring templates (Ruby 23rd, others 30th) ✅

#### **4. Non-Billable Cost Tracking**
**Before**: Sample costs mixed with regular expenses  
**After**: Dedicated "Samples" category for non-billable costs ✅

#### **5. Financial Reconciliation**
**Before**: Bank accounts don't match expense records  
**After**: Same bank accounts across all systems = easy reconciliation ✅

---

## 📈 **MONTHLY WORKFLOW EXAMPLE**

### **October 2025 Expense Management**:

**Week 1** (October 1-7):
- [ ] Review scheduled October expenses
- [ ] Verify bank account balances
- [ ] Process any pending entertainment expenses

**Week 2** (October 8-15):
- [ ] Track any sample costs for customer evaluations
- [ ] Record travel expenses for business trips
- [ ] Update utility bills

**Week 3** (October 16-22):
- [ ] Prepare for Ruby's salary (23rd)
- [ ] Verify Alipay account balance
- [ ] Process any pending marketing expenses

**Week 4** (October 23-30):
- [x] **October 23**: Pay Ruby (¥6,500 via Alipay)
- [ ] **October 30**: Pay all other staff:
  - Yiwu: Peng, Zheng, Lin Yi, James (¥28,000 total)
  - Shenzhen: Lily, Xiao Min, Silent Artist (¥32,000 total)
  - Greece: Nikos, Chrysanthi (€1,980 total)
- [ ] Record any last-minute October expenses

**Month End** (October 31):
- [ ] Review total October expenses
- [ ] Compare to budget
- [ ] Export report for accountant
- [ ] Prepare November expense schedule

---

## 🎯 **SUCCESS METRICS**

Track these KPIs monthly:
1. **Total Monthly Payroll**: ¥66,500 + €1,980 (fixed)
2. **Average Monthly Samples Cost**: Track trend (should decrease as conversion improves)
3. **Entertainment ROI**: Correlate dinner expenses with customer orders
4. **Office Costs per Revenue**: Calculate cost efficiency per office
5. **Recurring vs One-time**: Monitor operational stability

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Issue: Bank account dropdown empty**
**Solution**: Ensure bank accounts exist in Financial Management page first

### **Issue: Expense not saving**
**Solution**: Check that required fields are filled (Category, Payee, Office, Amount)

### **Issue: Can't find specific expense**
**Solution**: Clear all filters and search by payee name

### **Issue: Recurring payment not scheduled**
**Solution**: Check "Recurring Expense" checkbox and set frequency + day

---

## 🎊 **READY TO USE**

The Company Expenses system is **LIVE and READY** with:

✅ **11 Staff Salaries Pre-loaded** (all recurring, proper payment dates)  
✅ **2 Office Rents Pre-loaded** (annual payments)  
✅ **Bank Accounts Integrated** (same as customer/supplier transactions)  
✅ **Multi-Currency Support** (RMB, EUR, USD, GBP, HKD)  
✅ **Recurring Templates Active** (automatic tracking)  
✅ **Export Functionality** (Excel-ready CSV)  
✅ **Visual Analytics** (category & office charts)  

**Access Now**: Click **"Company Expenses"** button on dashboard! 🚀

---

**Document Version**: 1.0  
**Created**: October 12, 2025  
**Status**: COMPLETE & READY FOR USE  
**Pre-loaded Data**: 12 expense records (11 staff + 2 rent payments)
