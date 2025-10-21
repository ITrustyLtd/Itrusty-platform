# Bank Balance Update Flowchart
## Visual Logic Flow

---

## 📥 CUSTOMER TRANSACTION FLOW (Income)

```
┌─────────────────────────────────────────┐
│   USER ACTION                           │
│   Create/Edit Customer Transaction     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   CHECK: Is there a bank_account?      │
└────────┬──────────────────┬─────────────┘
         │ YES              │ NO
         ▼                  ▼
┌────────────────┐    ┌─────────────────┐
│ bank_account   │    │ ⚠️ Skip balance │
│ specified      │    │ update          │
└────────┬───────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   CHECK: Is total_paid > 0?            │
└────────┬──────────────────┬─────────────┘
         │ YES              │ NO
         ▼                  ▼
┌────────────────┐    ┌─────────────────┐
│ total_paid     │    │ ⚠️ Skip balance │
│ has value      │    │ update          │
└────────┬───────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   DETERMINE ACTION TYPE                 │
└────────┬────────────────────────────────┘
         │
         ├──► CREATE NEW
         │    └──► Balance: +total_paid
         │
         ├──► EDIT AMOUNT
         │    └──► Balance: +(new - old)
         │
         ├──► CHANGE ACCOUNT
         │    └──► Old Acct: -total_paid
         │         New Acct: +total_paid
         │
         └──► DELETE
              └──► Balance: -total_paid (reversal)
```

---

## 📤 SUPPLIER TRANSACTION FLOW (Expense)

```
┌─────────────────────────────────────────┐
│   USER ACTION                           │
│   Create/Edit Supplier Transaction     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   CHECK: Is there a bank_account?      │
└────────┬──────────────────┬─────────────┘
         │ YES              │ NO
         ▼                  ▼
┌────────────────┐    ┌─────────────────┐
│ bank_account   │    │ ⚠️ Skip balance │
│ specified      │    │ update          │
└────────┬───────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   CHECK: Is amount > 0?                 │
└────────┬──────────────────┬─────────────┘
         │ YES              │ NO
         ▼                  ▼
┌────────────────┐    ┌─────────────────┐
│ amount has     │    │ ⚠️ Skip balance │
│ value          │    │ update          │
└────────┬───────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   CHECK: Is status === 'Paid'?         │
└────────┬──────────────────┬─────────────┘
         │ YES              │ NO (Pending/Scheduled)
         ▼                  ▼
┌────────────────┐    ┌─────────────────┐
│ Status is Paid │    │ ⚠️ Skip balance │
│ Proceed        │    │ update (wait)   │
└────────┬───────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   DETERMINE ACTION TYPE                 │
└────────┬────────────────────────────────┘
         │
         ├──► CREATE NEW (Status=Paid)
         │    └──► Balance: -amount
         │
         ├──► STATUS CHANGE
         │    ├──► Pending → Paid
         │    │    └──► Balance: -amount
         │    └──► Paid → Cancelled
         │         └──► Balance: +amount (refund)
         │
         ├──► EDIT AMOUNT (Status=Paid)
         │    └──► Balance: -(new - old)
         │
         ├──► CHANGE ACCOUNT (Status=Paid)
         │    └──► Old Acct: +amount (reverse)
         │         New Acct: -amount (apply)
         │
         └──► DELETE (was Status=Paid)
              └──► Balance: +amount (reversal)
```

---

## 🔧 UPDATE BANK ACCOUNT BALANCE FUNCTION

```
┌─────────────────────────────────────────┐
│   updateBankAccountBalance()            │
│   (bankAccountName, amountChange)       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   FIND ACCOUNT by name                  │
│   in bankAccounts array                 │
└────────┬──────────────────┬─────────────┘
         │ FOUND            │ NOT FOUND
         ▼                  ▼
┌────────────────┐    ┌─────────────────┐
│ Get account    │    │ ❌ Log error    │
│ object         │    │ Exit function   │
└────────┬───────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   CALCULATE NEW BALANCE                 │
│   newBalance = currentBalance + change  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   API CALL: PATCH                       │
│   tables/financial_accounts/{id}        │
│   Body: { balance: newBalance }         │
└────────┬──────────────────┬─────────────┘
         │ SUCCESS          │ FAIL
         ▼                  ▼
┌────────────────┐    ┌─────────────────┐
│ ✅ Update      │    │ ❌ Log error    │
│ local cache    │    │ Transaction ok  │
│ localStorage   │    │ but balance not │
└────────────────┘    └─────────────────┘
```

---

## 💡 EXAMPLE SCENARIOS

### Scenario 1: Simple Customer Payment
```
User Action:
  Add Transaction
  └─ Customer: AGL
  └─ Total Paid: €1000
  └─ Bank: EUR CCB

Flow:
  ✅ bank_account exists
  ✅ total_paid > 0
  ✅ Action: CREATE NEW
  
Execution:
  updateBankAccountBalance("EUR CCB", +1000)
  └─ Find EUR CCB account
  └─ Current balance: €10,000
  └─ New balance: €11,000
  └─ PATCH API call
  └─ ✅ Success

Result:
  EUR CCB balance: €10,000 → €11,000
```

---

### Scenario 2: Supplier Payment Status Change
```
User Action:
  Edit Payment
  └─ Status: Pending → Paid
  └─ Amount: ¥5000
  └─ Bank: CNY ICBC

Flow:
  ✅ bank_account exists
  ✅ amount > 0
  ✅ oldStatus = Pending (didn't affect balance)
  ✅ newStatus = Paid (now affects balance)
  ✅ Action: STATUS CHANGE (Pending→Paid)
  
Execution:
  updateBankAccountBalance("CNY ICBC", -5000)
  └─ Find CNY ICBC account
  └─ Current balance: ¥20,000
  └─ New balance: ¥15,000
  └─ PATCH API call
  └─ ✅ Success

Result:
  CNY ICBC balance: ¥20,000 → ¥15,000
```

---

### Scenario 3: Delete Customer Payment
```
User Action:
  Delete Transaction
  └─ Customer: AGL
  └─ Total Paid: €1000 (was recorded)
  └─ Bank: EUR CCB

Flow:
  ✅ bank_account exists
  ✅ total_paid > 0
  ✅ Action: DELETE
  
Execution:
  updateBankAccountBalance("EUR CCB", -1000)
  └─ Find EUR CCB account
  └─ Current balance: €11,000
  └─ New balance: €10,000 (reversal)
  └─ PATCH API call
  └─ ✅ Success

Result:
  EUR CCB balance: €11,000 → €10,000
```

---

### Scenario 4: Change Bank Account
```
User Action:
  Edit Transaction
  └─ Change Bank: EUR CCB → USD CCB
  └─ Amount: €500
  
Flow:
  ✅ bank_account changed
  ✅ total_paid > 0
  ✅ Action: CHANGE ACCOUNT
  
Execution:
  Step 1: updateBankAccountBalance("EUR CCB", -500)
          └─ EUR CCB: €11,000 → €10,500
  
  Step 2: updateBankAccountBalance("USD CCB", +500)
          └─ USD CCB: $8,000 → $8,500

Result:
  EUR CCB: €11,000 → €10,500
  USD CCB: $8,000 → $8,500
```

---

## 🔍 DECISION TREE SUMMARY

### For Customer Transactions:
```
Has bank_account? ──YES──> Has total_paid? ──YES──> UPDATE BALANCE (+)
      │                            │
      NO                           NO
      │                            │
      └──> SKIP                    └──> SKIP
```

### For Supplier Transactions:
```
Has bank_account? ──YES──> Has amount? ──YES──> Status=Paid? ──YES──> UPDATE BALANCE (-)
      │                         │                      │
      NO                        NO                     NO
      │                         │                      │
      └──> SKIP                 └──> SKIP              └──> SKIP (wait for Paid)
```

---

**Key Principle:** Customer payments ALWAYS update when saved. Supplier payments ONLY update when status is "Paid".
