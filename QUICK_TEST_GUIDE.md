# 🧪 QUICK TEST GUIDE - Phase 4 Enhancements

## ⚡ 5-MINUTE TEST CHECKLIST

### **Test 1: Bank Accounts (30 seconds)**
```
✅ Open transactions-customers.html
✅ Click any cell in "Bank Account" column
✅ Dropdown appears with 10 bank accounts
✅ Accounts show format: "Account Name (Currency)"
```

### **Test 2: Edit Modal (2 minutes)**
```
✅ Click blue edit icon (📝) on any transaction
✅ Modal opens ABOVE page content (not behind)
✅ All fields populated with current values
✅ Customer dropdown shows all customers
✅ Bank account dropdown shows 10 accounts
✅ Change CI Amount → Outstanding updates instantly
✅ Change Total Paid → Outstanding recalculates
✅ Outstanding shows orange if > 0, green if = 0
```

### **Test 3: File Upload (1 minute)**
```
✅ In edit modal, click "Choose Files"
✅ Upload 1 image (JPG/PNG)
✅ Upload 1 PDF document
✅ Both files appear with previews
✅ Click image → Fullscreen view opens
✅ Click outside → Fullscreen closes
✅ Click X on file → File removed
```

### **Test 4: Save & Delete (1 minute)**
```
✅ Make a change in edit modal
✅ Click "Save Changes"
✅ Modal closes
✅ Table updates with new data
✅ Dashboard recalculates totals
✅ Open edit modal again
✅ Click "Delete Transaction"
✅ Confirmation dialog appears
✅ Cancel → Modal stays open
✅ Try again → Confirm → Transaction deleted
✅ Table refreshes without that transaction
```

### **Test 5: Dashboard Height (30 seconds)**
```
✅ Scroll to dashboard section
✅ Dashboard height ≤ 2/3 of screen
✅ Charts constrained to reasonable height
✅ Can scroll within dashboard cards
✅ Can scroll page to see all content
```

---

## ✅ SUCCESS CRITERIA

Phase 4 enhancements are working if:

✅ Bank accounts load from database  
✅ Edit modal opens above page content  
✅ All fields are editable in modal  
✅ File upload works (images + docs)  
✅ Outstanding auto-calculates  
✅ Save changes persists to database  
✅ Delete transaction works with confirmation  
✅ Dashboard height constrained  
✅ Charts render within fixed height  
✅ Supplier status color-coding works  
✅ No JavaScript errors in console  
✅ All dropdowns populate correctly  

---

**Ready to test? Open `transactions-customers.html` and start with Test 1!** 🚀
