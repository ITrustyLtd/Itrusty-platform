# 🧪 Testing Checklist - I Trusty Platform v3.0

**Date**: May 2025  
**Tester**: Ιωάννης Βλαχόπουλος

---

## ✅ Navigation System

### **Test 1: Dropdown Menus**
- [ ] Open `index.html` in browser
- [ ] **Click** on "Operations" button
- [ ] Menu should **stay open** when moving mouse down
- [ ] Click on "Projects" link → Should navigate to projects page
- [ ] **Click** on "Financial" button
- [ ] Menu should open, previous menu should close
- [ ] Click on "Invoices" → Should see "NEW" badge
- [ ] Click "Invoices" → Should open `invoices-creator.html`

**Expected Result**: ✅ Menus stay open, clickable, navigate correctly

**Actual Result**: _____________________________________________

---

### **Test 2: Close on Outside Click**
- [ ] Open any dropdown menu
- [ ] Click anywhere outside the menu (on the page background)
- [ ] Menu should close

**Expected Result**: ✅ Menu closes when clicking outside

**Actual Result**: _____________________________________________

---

## 📦 Products Library

### **Test 3: Add New Product**
- [ ] Navigate to: **CRM & Sales → Products Library**
- [ ] Page loads with stats cards (Total Products, Active, Categories, Suppliers)
- [ ] Click "Add New Product" button
- [ ] Modal opens with form
- [ ] Fill in **required fields**:
  - Product Name: "Test LED Bulb"
  - Price RMB: 5.00
- [ ] Click "Save Product"
- [ ] Should see success message: "✅ Product created successfully!"
- [ ] Product appears in grid with auto-generated SKU (e.g., SKU-2025-00001)

**Expected Result**: ✅ Product created, SKU auto-generated, appears in list

**Actual Result**: _____________________________________________

---

### **Test 4: Edit Product**
- [ ] Click on any product card in the grid
- [ ] Modal opens with **pre-filled data**
- [ ] Change product name to "Test LED Bulb EDITED"
- [ ] Click "Update Product"
- [ ] Should see success message
- [ ] Product name updated in grid

**Expected Result**: ✅ Product edited successfully, changes reflected

**Actual Result**: _____________________________________________

---

### **Test 5: Search & Filter**
- [ ] Type "LED" in search box
- [ ] Should see filtered results (only LED products)
- [ ] Clear search
- [ ] Select "Electronics" from Category filter
- [ ] Should see only Electronics products
- [ ] Select "Active" from Status filter
- [ ] Should see only active products

**Expected Result**: ✅ Filters work independently and correctly

**Actual Result**: _____________________________________________

---

## 🧾 Invoicing System

### **Test 6: Create Quotation**
- [ ] Navigate to: **Financial → Invoices**
- [ ] Select invoice type: "Quotation"
- [ ] Select customer from dropdown (or create test customer first)
- [ ] Click "Add Row"
- [ ] Fill in product details:
  - Name: "Test Product"
  - CTN: 5
  - QTY/CTN: 100
  - Unit Price: 3.50
  - Markup %: 25
- [ ] **Watch for real-time calculations**:
  - Total Qty should = 500
  - Total Price should = €2,187.50
- [ ] Subtotal should update automatically
- [ ] Add Mainland Costs: 120
- [ ] Grand Total should update
- [ ] Click "Save Invoice"
- [ ] Should see success message

**Expected Result**: ✅ Invoice created, calculations correct, saved to database

**Actual Result**: _____________________________________________

---

### **Test 7: Create Commercial Invoice (Auto-Transaction)**
- [ ] Create new invoice, select type: "Commercial Invoice"
- [ ] Add customer, products, save
- [ ] Should see message: "💰 Financial transaction created automatically"
- [ ] Go to **Finance Dashboard**
- [ ] Should see new transaction with:
  - Type: Income
  - Category: Sales
  - Amount: (same as invoice grand total)
  - Description: "Commercial Invoice CIV-..."

**Expected Result**: ✅ Transaction auto-created and linked to invoice

**Actual Result**: _____________________________________________

---

### **Test 8: Invoice History**
- [ ] Navigate to: **Financial → Invoice History**
- [ ] Should see list of all saved invoices
- [ ] Stats cards show correct counts
- [ ] Click any invoice row
- [ ] Should open invoice in creator (edit mode)
- [ ] Click "Duplicate" button
- [ ] Should create copy with "-COPY" suffix

**Expected Result**: ✅ History displays, clickable, duplicate works

**Actual Result**: _____________________________________________

---

## 💸 Sales Commissions Auto-Fetch

### **Test 9: Auto-Fetch Invoice Data**
- [ ] Navigate to: **Financial → Sales Commissions**
- [ ] Click "Νέα Εγγραφή Προμήθειας"
- [ ] Type invoice number in "Αριθμός Τιμολογίου" field
  - Example: `CIV-20251014-ABC-001`
- [ ] Wait 500ms (debounce)
- [ ] **Check if fields auto-fill**:
  - "Αξία Προϊόντων (Μόνο)" = invoice.subtotal_products
  - "Συνολικό Ποσό Παραγγελίας" = invoice.grand_total
  - "Ημερομηνία" = invoice.invoice_date
- [ ] Input field should turn **green** (success indicator)
- [ ] Calculations should update automatically

**Expected Result**: ✅ Invoice data fetched, fields auto-filled, green border

**Actual Result**: _____________________________________________

---

### **Test 10: Invalid Invoice Number**
- [ ] Type non-existent invoice number: `XXX-99999999-ZZZ-999`
- [ ] Wait 500ms
- [ ] Input field should turn **orange** (warning color)
- [ ] Fields should NOT auto-fill

**Expected Result**: ✅ Orange border indicates "not found"

**Actual Result**: _____________________________________________

---

## 📅 Daily Activities

### **Test 11: No Duplicate Activities**
- [ ] Open `index.html`
- [ ] Click on any date in calendar (e.g., October 14)
- [ ] Modal opens with activities list
- [ ] **Check**: Are there duplicate activities?
- [ ] Each activity should appear **only once**
- [ ] Click on any **non-financial** activity (not yellow background)
- [ ] Edit modal should open

**Expected Result**: ✅ No duplicates, clickable activities open edit modal

**Actual Result**: _____________________________________________

---

### **Test 12: Financial Activities Not Editable**
- [ ] Find an activity with **yellow background** (Financial badge)
- [ ] Click on it
- [ ] Should see alert: "ℹ️ Financial transactions cannot be edited from here. Please go to the Transactions page."
- [ ] Modal should NOT open

**Expected Result**: ✅ Financial activities show alert, don't open modal

**Actual Result**: _____________________________________________

---

## 🔗 Integration Tests

### **Test 13: Invoice → Customer Stats**
- [ ] Create new quotation for customer "ABC Trading"
- [ ] Save invoice (grand total: €10,000)
- [ ] Go to **Customers** page
- [ ] Find "ABC Trading"
- [ ] Check customer record:
  - `total_invoices_count` should increase by 1
  - `total_quoted_amount` should increase by €10,000
  - `last_invoice_date` should be today

**Expected Result**: ✅ Customer stats updated automatically

**Actual Result**: _____________________________________________

---

### **Test 14: Commercial Invoice → Transaction → Finance**
- [ ] Create commercial invoice (€15,000)
- [ ] Go to **Finance Dashboard**
- [ ] Check transactions list:
  - New transaction with amount €15,000
  - Type: Income, Category: Sales
  - Linked to invoice (has invoice_id)
- [ ] Check P&L calculations:
  - Total income should include this €15,000

**Expected Result**: ✅ Transaction created, appears in finance, P&L updated

**Actual Result**: _____________________________________________

---

## 🎨 UI/UX Tests

### **Test 15: Responsive Design**
- [ ] Resize browser window to mobile size (< 768px)
- [ ] Navigation dropdowns still work
- [ ] Product cards stack vertically
- [ ] Invoice table scrolls horizontally
- [ ] All buttons remain clickable

**Expected Result**: ✅ Mobile-friendly, no overlapping elements

**Actual Result**: _____________________________________________

---

### **Test 16: Print Invoice**
- [ ] Open any invoice in creator
- [ ] Press **Ctrl+P** (or Cmd+P on Mac)
- [ ] Print preview opens
- [ ] **Check**: "MARKUP %" column is hidden
- [ ] **Check**: Internal notes are hidden
- [ ] **Check**: Layout fits A4 page
- [ ] Click "Save as PDF"

**Expected Result**: ✅ Internal columns hidden, professional PDF generated

**Actual Result**: _____________________________________________

---

## 🐛 Bug Report Template

If any test fails, fill out:

```
❌ Test Failed: [Test Number & Name]

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:


Actual Result:


Error Message (if any):


Browser: Chrome / Firefox / Safari / Edge
Version: 

Screenshot: [paste image URL or attach]
```

---

## ✅ Final Checklist

- [ ] **ALL 16 tests passed**
- [ ] No console errors in browser DevTools (F12)
- [ ] No broken links (all pages load)
- [ ] No duplicate data in database
- [ ] All calculations are accurate
- [ ] All integrations work (invoice → transaction, commission, customer)

---

## 📊 Test Results Summary

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Navigation | 2 | ___ | ___ | |
| Products | 3 | ___ | ___ | |
| Invoicing | 3 | ___ | ___ | |
| Commissions | 2 | ___ | ___ | |
| Activities | 2 | ___ | ___ | |
| Integrations | 2 | ___ | ___ | |
| UI/UX | 2 | ___ | ___ | |
| **TOTAL** | **16** | ___ | ___ | |

---

## 🚀 Next Steps After Testing

### If ALL tests pass ✅:
1. Deploy to production (Publish tab)
2. Train team members (Lily, Peng, Nikos)
3. Start migrating real data

### If tests fail ❌:
1. Document failures using bug report template
2. Share with developer (me)
3. Wait for fixes
4. Re-test failed scenarios

---

**Tester Signature**: _________________________  
**Date**: _________________________  
**Overall Status**: ✅ PASS / ❌ FAIL / ⏳ IN PROGRESS
