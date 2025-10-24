# 🧪 Quick Test Guide - Phase 4 Critical Fixes

## Test These 5 Critical Workflows

### ✅ Test 1: Page Load (Empty Table Fixed)
1. Open `/transactions-customers.html`
2. **EXPECTED**: Table shows existing transactions immediately
3. **FAIL IF**: Table is empty or requires action first
4. Check browser console for "✅ Loaded transactions from localStorage" messages

---

### ✅ Test 2: Add Transaction (Modal Flow Fixed)
1. Click **"Add Transaction"** button
2. **EXPECTED**: Modal opens with empty form
3. Fill required fields:
   - Customer Code: Select from dropdown
   - Invoice Number: Type "TEST-INV-001"
   - CI Amount: 1000
   - Total Paid: 500
   - Outstanding: Should show €500 (auto-calculated)
4. Click **"Create Transaction"**
5. **EXPECTED**: Modal closes, new transaction appears in table
6. **FAIL IF**: Empty row created before filling form

---

### ✅ Test 3: Edit Transaction (Persistence Fixed)
1. Click **edit icon** (pencil) on any transaction
2. **EXPECTED**: Modal opens with populated fields
3. Change CI Amount to 2000
4. Change Total Paid to 1500
5. Outstanding should update to €500
6. Click **"Save Changes"**
7. **EXPECTED**: Modal closes, table shows updated data immediately
8. **FAIL IF**: Transaction disappears or shows old data

---

### ✅ Test 4: Data Persistence (localStorage)
1. Add or edit a transaction
2. **Refresh the page** (F5)
3. **EXPECTED**: All data still visible
4. Open **DevTools** → Application → Local Storage
5. Check `transactions_customers` key exists with JSON data
6. **EXPECTED**: localStorage contains your transaction data
7. **FAIL IF**: Data disappeared after refresh

---

### ✅ Test 5: Delete Transaction
1. Click **edit icon** on any transaction
2. Click **"Delete Transaction"** button (red, bottom-left)
3. **EXPECTED**: Confirmation dialog appears
4. Click **OK**
5. **EXPECTED**: Modal closes, transaction removed from table
6. Refresh page
7. **EXPECTED**: Transaction still gone (deleted from database and localStorage)

---

## Same Tests for Supplier Transactions

Repeat all 5 tests on `/transactions-suppliers.html`:
1. Page loads with data
2. Add new supplier payment via modal
3. Edit existing payment
4. Refresh → data persists
5. Delete payment

---

## File Upload Bonus Test (Optional)

1. Open Add or Edit modal
2. Click **"Choose Files"** in Attachments section
3. Select an image or PDF (under 20MB)
4. **EXPECTED**: File preview appears with thumbnail
5. Save transaction
6. Re-open edit modal
7. **EXPECTED**: Attached file still visible
8. Click **X** to remove file
9. **EXPECTED**: File removed from list

---

## Quick Console Check

Open browser DevTools (F12) → Console tab, check for:

✅ **Good Messages**:
```
✅ Loaded transactions from localStorage (backup)
✅ Loaded bank accounts from localStorage (backup)
Transaction added successfully!
Transaction updated successfully!
```

❌ **Bad Messages** (Should NOT appear):
```
Error loading data
Failed to save
Uncaught TypeError
```

---

## If You Find Issues

1. **Note which test failed** (1-5)
2. **Copy any error messages** from console
3. **Screenshot the issue** if visual
4. **Report back** with details

---

## Success Criteria

🎯 **ALL TESTS PASS** = Ready for Phase 5!

✅ Page loads with data  
✅ Add transaction works (modal first)  
✅ Edit transaction persists  
✅ Data survives refresh  
✅ Delete works correctly  
✅ File upload functional (bonus)

---

**Testing Time**: ~5 minutes per page (10 minutes total)

**Files to Test**:
- `/transactions-customers.html`
- `/transactions-suppliers.html`

**After Testing**: Let me know results and we proceed to Phase 5! 🚀
