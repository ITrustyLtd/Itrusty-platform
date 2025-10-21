# 📋 CSV Upload - Quick Reference Card

**Print this & keep on desk!** 🖨️

---

## ⚡ 3-Second Usage

```
1. Click: 📤 Upload Products from CSV
2. Select: CSV file
3. Done: Products loaded!
```

---

## 📄 CSV Format

### **Minimum Required**
```csv
Name,Unit Price EUR
LED Bulb,3.50
USB Cable,1.85
```

### **Full Template**
```csv
Item Number,Picture URL,Name,Description,CTN,QTY per CTN,Unit Price EUR,Product URL,Image URL,Notes,Price CNY,FX Rate,Markup %
```

---

## ✅ Checklist Before Upload

- [ ] File is `.csv` format
- [ ] Has `Name` column
- [ ] Has `Unit Price EUR` column
- [ ] No spaces in column names
- [ ] Numbers use `.` not `,`

---

## ⚠️ Common Errors

| Error | Fix |
|-------|-----|
| "Λείπουν στήλες" | Add `Name` & `Unit Price EUR` |
| "CSV parsing error" | Save as CSV in Excel |
| "Κενό αρχείο" | Add data rows |
| Images don't show | Use public URLs |

---

## 🎯 Test File

**Use**: `TEST_SAMPLE_PRODUCTS.csv`  
**Contains**: 5 electronics products  
**Expected**: €351,700.00 subtotal

---

## 📊 Results Check

After upload verify:
- ✅ Products in grid
- ✅ TOTAL QTY calculated
- ✅ TOTAL PRICE calculated
- ✅ Subtotal updated
- ✅ Images show (if URLs)

---

## 🆘 Quick Help

**Files to Check:**
- `🚀_QUICK_START_CSV_UPLOAD.md` - Start here
- `🧪_CSV_UPLOAD_TESTING_GUIDE.md` - Full testing
- `📄_ΟΔΗΓΙΕΣ_TEMPLATE_ΠΡΟΪΟΝΤΩΝ.md` - Template help

---

## 📞 Status

**Version**: 3.3.0  
**Date**: May 15, 2025  
**Status**: ✅ Production Ready

---

**Keep this card for daily use!** 📌
