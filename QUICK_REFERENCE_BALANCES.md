# Quick Reference: Bank Balance Updates
## How It Works Now ✅

---

## 📥 CUSTOMER PAYMENTS (Money Coming IN)

### Rule: **Always increases balance**

| Action | Balance Change | Status Required? |
|--------|----------------|------------------|
| New payment | **+Total Paid** | No |
| Edit amount | **+/- Difference** | No |
| Change account | Old: **-**, New: **+** | No |
| Delete | **-Total Paid** (reversal) | No |

**Important:** Only "Total Paid" field affects balance (not CI Amount)

---

## 📤 SUPPLIER PAYMENTS (Money Going OUT)

### Rule: **Only "Paid" status decreases balance**

| Action | Balance Change | Status Required? |
|--------|----------------|------------------|
| New payment (Paid) | **-Amount** | YES (must be Paid) |
| New payment (Pending) | **No change** | N/A |
| Pending → Paid | **-Amount** | YES |
| Paid → Cancelled | **+Amount** (refund) | YES |
| Edit amount (Paid) | **+/- Difference** | YES (must stay Paid) |
| Change account (Paid) | Old: **+**, New: **-** | YES |
| Delete (Paid) | **+Amount** (reversal) | YES |

**Important:** Pending/Scheduled payments do NOT affect balance until marked as Paid

---

## 🎯 Quick Examples

### Example 1: Customer Payment
```
Action: Record €1000 to EUR CCB
Result: EUR CCB balance +€1000 immediately ✅
```

### Example 2: Supplier Payment (Pending)
```
Action: Record ¥5000 as Pending to CNY ICBC
Result: CNY ICBC balance unchanged (still pending) ✅
```

### Example 3: Change Status to Paid
```
Action: Edit payment from Pending → Paid
Result: CNY ICBC balance -¥5000 now ✅
```

### Example 4: Switch Bank Account
```
Before: €500 in EUR CCB
Action: Change account to USD CCB
After: EUR CCB -€500, USD CCB +€500 ✅
```

---

## 🔍 Console Messages

### Success:
```
💰 Updating EUR CCB: current balance 10000, change 500
✅ Bank account EUR CCB updated: new balance = 10500
```

### Warning (Pending):
```
⚠️ No bank account specified, skipping balance update
```

### Error:
```
❌ Bank account not found: XYZ Bank
❌ Failed to update bank account balance
```

---

## ⚠️ Important Rules

1. **Currency Matching**: Transaction currency must match account currency
   - EUR → EUR account ✅
   - EUR → USD account ❌

2. **Status Matters (Suppliers Only)**:
   - Paid = Updates balance ✅
   - Pending = No update ❌
   - Scheduled = No update ❌
   - Cancelled = No update ❌

3. **Customer Payments Have No Status**: All recorded payments affect balance immediately

4. **Deletions Reverse Changes**: Deleting a payment undoes the balance change

---

## 📊 Testing Your Setup

1. **Record starting balance** (check finance.html)
2. **Make a test payment**
3. **Check console** (F12 → Console)
4. **Verify new balance** (refresh finance.html)
5. **Expected result**: Balance changed by exact amount

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Balance not updating | Check console for errors |
| Wrong direction (+/-) | Customer = +, Supplier = - |
| Pending not updating | Correct! Only Paid updates |
| Account name error | Verify exact name in finance.html |

---

**Need Help?** Check console logs (F12) for detailed debugging info.
