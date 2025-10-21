# Bank Balance Auto-Update - Testing Checklist
## October 13, 2025

---

## 🧪 Testing Scenarios

### ✅ Customer Transactions (Income - transactions-customers.html)

#### Test 1: Create New Payment
- [ ] Open `transactions-customers.html`
- [ ] Click "Add Transaction"
- [ ] Fill in:
  - Customer: Any customer
  - Invoice: TEST-001
  - CI Amount: €1000
  - **Total Paid: €500** ← This affects balance
  - Currency: EUR
  - **Bank Account: EUR CCB** ← This account will be updated
- [ ] Click "Create Transaction"
- [ ] **Expected:** EUR CCB balance increases by €500
- [ ] **Check console:** `💰 Updating EUR CCB: current balance X, change 500`
- [ ] **Check console:** `✅ Bank account EUR CCB updated: new balance = X+500`
- [ ] Go to `finance.html` and verify EUR CCB balance increased

#### Test 2: Edit Payment Amount
- [ ] Find the TEST-001 payment from Test 1
- [ ] Click Edit (blue pencil icon)
- [ ] Change **Total Paid: €500 → €800**
- [ ] Click "Save Changes"
- [ ] **Expected:** EUR CCB balance increases by €300 more (difference)
- [ ] **Check console:** `💰 Updating EUR CCB: current balance Y, change 300`
- [ ] Verify balance is now +€800 total from original

#### Test 3: Change Bank Account
- [ ] Edit TEST-001 payment again
- [ ] Change **Bank Account: EUR CCB → USD CCB**
- [ ] Keep Total Paid: €800
- [ ] Click "Save Changes"
- [ ] **Expected:** 
  - EUR CCB balance decreases by €800 (reversed)
  - USD CCB balance increases by €800
- [ ] **Check console:** Two balance updates logged
- [ ] Verify both accounts changed correctly

#### Test 4: Delete Payment
- [ ] Find TEST-001 payment
- [ ] Click Edit → Click "Delete Transaction"
- [ ] Confirm deletion
- [ ] **Expected:** USD CCB balance decreases by €800 (reversal)
- [ ] **Check console:** `💰 Updating USD CCB: current balance Z, change -800`
- [ ] Verify account balance reverted

---

### ✅ Supplier Transactions (Expenses - transactions-suppliers.html)

#### Test 5: Create Pending Payment (No Balance Change)
- [ ] Open `transactions-suppliers.html`
- [ ] Click "Add Payment"
- [ ] Fill in:
  - Supplier: Test Supplier
  - Amount: ¥5000
  - Currency: RMB
  - Bank Account: CNY ICBC
  - **Status: Pending** ← Important!
- [ ] Click "Create Payment"
- [ ] **Expected:** CNY ICBC balance **DOES NOT** change (because Pending)
- [ ] **Check console:** `⚠️ No bank account specified, skipping balance update`
- [ ] Verify CNY ICBC balance unchanged

#### Test 6: Change Status from Pending to Paid
- [ ] Find the Test Supplier payment from Test 5
- [ ] Click Edit
- [ ] Change **Status: Pending → Paid**
- [ ] Click "Save Changes"
- [ ] **Expected:** CNY ICBC balance decreases by ¥5000 (expense applied now)
- [ ] **Check console:** `💰 Updating CNY ICBC: current balance X, change -5000`
- [ ] Verify CNY ICBC balance decreased

#### Test 7: Edit Paid Amount
- [ ] Edit Test Supplier payment again (currently Paid, ¥5000)
- [ ] Change **Amount: ¥5000 → ¥7000**
- [ ] Click "Save Changes"
- [ ] **Expected:** CNY ICBC balance decreases by ¥2000 more (difference)
- [ ] **Check console:** `💰 Updating CNY ICBC: current balance Y, change -2000`
- [ ] Verify balance is now -¥7000 total from original

#### Test 8: Change Status from Paid to Cancelled
- [ ] Edit Test Supplier payment again (currently Paid, ¥7000)
- [ ] Change **Status: Paid → Cancelled**
- [ ] Click "Save Changes"
- [ ] **Expected:** CNY ICBC balance increases by ¥7000 (reversal/refund)
- [ ] **Check console:** `💰 Updating CNY ICBC: current balance Z, change 7000`
- [ ] Verify balance increased (money came back)

#### Test 9: Delete Paid Payment
- [ ] Change Test Supplier payment back to Paid
- [ ] Click Edit → Click "Delete Transaction"
- [ ] Confirm deletion
- [ ] **Expected:** If was Paid, balance increases (reversal)
- [ ] **Check console:** Balance update logged
- [ ] Verify account balance reverted

---

### ✅ Edge Cases & Error Handling

#### Test 10: No Bank Account Selected
- [ ] Create payment without selecting bank account
- [ ] Save
- [ ] **Expected:** No balance update, console shows warning
- [ ] **Check console:** `⚠️ No bank account specified, skipping balance update`

#### Test 11: Zero Amount
- [ ] Create payment with amount = 0
- [ ] Save
- [ ] **Expected:** No balance change
- [ ] Verify no unnecessary API calls

#### Test 12: Rapid Sequential Changes
- [ ] Edit payment, change amount
- [ ] Save, immediately edit again
- [ ] Change amount again, save
- [ ] **Expected:** All balance updates applied correctly in sequence
- [ ] Verify final balance matches total of all changes

#### Test 13: Invalid Account Name
- [ ] Use browser console to manually set invalid account name
- [ ] Save transaction
- [ ] **Expected:** Error logged in console
- [ ] **Check console:** `❌ Bank account not found: [Invalid Name]`
- [ ] Transaction still saves, but balance not updated

---

## 🔍 Console Output Verification

### Expected Log Pattern (Customer Payment €500 to EUR CCB):
```
💰 Updating EUR CCB: current balance 10000, change 500
✅ Bank account EUR CCB updated: new balance = 10500
```

### Expected Log Pattern (Supplier Payment ¥5000 from CNY ICBC):
```
💰 Updating CNY ICBC: current balance 20000, change -5000
✅ Bank account CNY ICBC updated: new balance = 15000
```

### Expected Warning (Pending Payment):
```
⚠️ No bank account specified, skipping balance update
```

### Expected Error (Invalid Account):
```
❌ Bank account not found: XYZ Invalid Bank
```

---

## 📊 Balance Reconciliation Test

### Final Verification:
1. [ ] Record starting balances for all accounts (finance.html)
2. [ ] Perform 10 random transactions (mix of customer/supplier)
3. [ ] Manually calculate expected final balances
4. [ ] Compare calculated vs actual balances
5. [ ] **Expected:** All balances match within ±0.01 (rounding)

---

## ⚠️ Common Issues & Solutions

### Issue 1: Balance not updating
**Check:**
- Bank account name matches exactly (case-sensitive)
- For suppliers: Status must be "Paid"
- For customers: Total Paid must be > 0
- Console for error messages

### Issue 2: Wrong direction (+ instead of -)
**Check:**
- Customer payments should **increase** balance (+)
- Supplier payments should **decrease** balance (-)
- Verify transaction type

### Issue 3: Balance updates twice
**Check:**
- Not calling updateBankAccountBalance() multiple times
- No duplicate event handlers
- Check network tab for duplicate PATCH requests

---

## ✅ Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**All Tests Passed:** [ ] YES [ ] NO  
**Issues Found:** _______________  
**Ready for Production:** [ ] YES [ ] NO

---

**Notes:**
- Test on clean database state for accurate results
- Record all console logs for debugging
- Verify financial_accounts table directly in database after tests
- Compare with finance.html display to ensure UI matches database

