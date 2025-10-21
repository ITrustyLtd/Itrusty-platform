# 🚀 Quick Start - CSV Upload Feature

## ⚡ Άμεση Χρήση σε 3 Βήματα

### **Βήμα 1: Άνοιξε το Invoice Creator**
```
📁 invoices-creator.html
```

### **Βήμα 2: Κλικ στο Upload Button**
Βρες το πράσινο κουμπί:
```
📤 Upload Products from CSV
```
(Δίπλα στο "Add Product Row")

### **Βήμα 3: Επίλεξε CSV File**
Χρησιμοποίησε:
- `TEST_SAMPLE_PRODUCTS.csv` (για δοκιμή)
- ή το δικό σου CSV με το template format

---

## 📋 Τι Θα Δεις

### **Αποτέλεσμα με TEST_SAMPLE_PRODUCTS.csv**
```
✅ 5 προϊόντα προστέθηκαν:

1. LED Bulb E27 12W        → 50,000 pcs @ €3.50  = €175,000.00
2. USB Cable Type-C 2m     → 50,000 pcs @ €1.85  = €92,500.00
3. Wireless Mouse 2.4GHz   → 6,000 pcs  @ €4.20  = €25,200.00
4. Power Bank 20000mAh     → 2,000 pcs  @ €8.50  = €17,000.00
5. Phone Holder Car Mount  → 20,000 pcs @ €2.10  = €42,000.00

📊 SUBTOTAL: €351,700.00
```

---

## 🎯 Γρήγορα Facts

| Feature | Status |
|---------|--------|
| **Bulk Import** | ✅ 100+ products in seconds |
| **Auto-Calculate** | ✅ Totals, subtotals, grand total |
| **Image Display** | ✅ If Image URL provided |
| **Validation** | ✅ Checks required columns |
| **Merge Options** | ✅ Replace or append |
| **File Types** | ✅ CSV, XLSX, XLS |

---

## 📄 CSV Format (Must Match)

### **Required Columns**
```csv
Name,Unit Price EUR
LED Bulb E27 12W,3.50
USB Cable Type-C,1.85
```

### **Full Template (All 13 Columns)**
```csv
Item Number,Picture URL,Name,Description,CTN,QTY per CTN,Unit Price EUR,Product URL,Image URL,Notes,Price CNY,FX Rate,Markup %
1,https://...,Product Name,Description,100,500,3.50,https://...,https://...,MOQ: 10000,100.00,7.8,25
```

---

## ⚠️ Common Mistakes

### ❌ **Wrong Column Names**
```csv
Product Name,Price  ← WRONG!
```
✅ **Correct:**
```csv
Name,Unit Price EUR  ← RIGHT!
```

### ❌ **Missing Headers**
```csv
LED Bulb,3.50  ← Missing header row!
```
✅ **Correct:**
```csv
Name,Unit Price EUR
LED Bulb,3.50  ← Header + Data
```

### ❌ **Commas in Values**
```csv
LED Bulb, 12W, White,3.50  ← Extra commas break parsing!
```
✅ **Correct:**
```csv
"LED Bulb, 12W, White",3.50  ← Quotes for values with commas
```

---

## 🐛 Troubleshooting

### **Error: "Λείπουν απαραίτητες στήλες"**
**Fix**: Βεβαιώσου ότι η 1η γραμμή έχει:
- `Name`
- `Unit Price EUR`

### **Error: "CSV parsing error"**
**Fix**: 
1. Άνοιξε το CSV σε Excel
2. Save As → CSV (Comma delimited)
3. Δοκίμασε ξανά

### **Οι εικόνες δεν εμφανίζονται**
**Fix**: Χρησιμοποίησε public URLs:
```
✅ https://example.com/image.jpg
❌ C:\Desktop\image.jpg (local paths don't work)
```

---

## 📚 Files Available

| File | Purpose |
|------|---------|
| `INVOICE_PRODUCTS_TEMPLATE.csv` | Template για δημιουργία CSV |
| `TEST_SAMPLE_PRODUCTS.csv` | Sample data για δοκιμή |
| `📄_ΟΔΗΓΙΕΣ_TEMPLATE_ΠΡΟΪΟΝΤΩΝ.md` | Αναλυτικές οδηγίες |
| `🧪_CSV_UPLOAD_TESTING_GUIDE.md` | Complete testing guide |

---

## 🎉 Success Indicators

✅ **Loading spinner** εμφανίζεται  
✅ **Alert**: "Επιτυχής φόρτωση! 📦 X προϊόντα προστέθηκαν"  
✅ **Grid** γεμίζει με products  
✅ **Subtotal** υπολογίζεται αυτόματα  
✅ **Images** εμφανίζονται (αν υπάρχουν URLs)  

---

## 🔮 What's Next?

### **Phase 3 (Coming Soon)**
- 💾 Auto-save products to Products Library
- 🔗 Bidirectional linking
- 🚫 Duplicate detection

### **Phase 4 (After Phase 3)**
- ⌨️ Autocomplete in Name field
- 🔍 Search Products Library
- ⚡ One-click auto-fill

### **Phase 5 (Final)**
- 📦 Bulk upload to Products Library
- 🎯 Direct database import

---

## 💬 Need Help?

**Δοκίμασε το feature και feedback:**

1. ✅ Δουλεύει;
2. 🐛 Βρήκες bugs;
3. 💡 Προτάσεις;
4. 🚀 Ready για Phase 3;

---

**Created**: May 15, 2025  
**Status**: ✅ Ready to Use  
**Version**: 3.3.0
