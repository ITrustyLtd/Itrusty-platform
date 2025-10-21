# 📄 Οδηγίες Χρήσης Template Προϊόντων

## 🎯 Σκοπός

Αυτό το template σου επιτρέπει να φορτώσεις **μαζικά** προϊόντα στο:
1. **Invoice Creator** - Για γρήγορη δημιουργία τιμολογίων
2. **Products Library** - Για αποθήκευση στη βάση δεδομένων

---

## 📊 Δομή Στηλών

| # | Στήλη | Περιγραφή | Παράδειγμα | Υποχρεωτικό |
|---|--------|-----------|------------|-------------|
| 1 | **Item Number** | Αριθμός σειράς (auto) | 1, 2, 3... | Όχι (auto) |
| 2 | **Picture URL** | URL εικόνας προϊόντος | `https://...image.jpg` | Όχι |
| 3 | **Name** | Όνομα προϊόντος | "LED Bulb E27 12W" | **ΝΑΙ** |
| 4 | **Description** | Περιγραφή | "220V Warm White..." | Όχι |
| 5 | **CTN** | Αριθμός κιβωτίων | 100 | **ΝΑΙ** |
| 6 | **QTY per CTN** | Τεμάχια ανά κιβώτιο | 500 | **ΝΑΙ** |
| 7 | **Unit Price EUR** | Τιμή μονάδας σε € | 3.50 | **ΝΑΙ** |
| 8 | **Product URL** | Link προμηθευτή | `https://1688.com/...` | Όχι |
| 9 | **Image URL** | URL εικόνας (backup) | `https://...image.jpg` | Όχι |
| 10 | **Notes** | Σημειώσεις | "MOQ: 10000 pcs" | Όχι |
| 11 | **Price CNY** | Τιμή σε RMB | 100.00 | Όχι |
| 12 | **FX Rate** | Συναλλαγματική ισοτιμία | 7.8 | Όχι (default: 7.8) |
| 13 | **Markup %** | Ποσοστό markup | 25 | Όχι (default: 25) |

---

## ✅ Παράδειγμα Γραμμής

```csv
1,https://example.com/led.jpg,LED Bulb E27 12W,220V Warm White,100,500,3.50,https://1688.com/led,https://example.com/led.jpg,MOQ: 10000,100.00,7.8,25
```

---

## 📝 Οδηγίες Συμπλήρωσης

### **1. Άνοιξε το Template**
- Άνοιξε το `INVOICE_PRODUCTS_TEMPLATE.csv` με Excel
- Διάγραψε τις παράδειγμα γραμμές (γραμμές 2-4)
- Κράτα ΜΟΝΟ τη γραμμή των headers (γραμμή 1)

### **2. Συμπλήρωσε τα Προϊόντα σου**
- Μία γραμμή = Ένα προϊόντα
- Συμπλήρωσε ΟΛΑ τα υποχρεωτικά πεδία (σημειωμένα με **ΝΑΙ**)
- Τα προαιρετικά πεδία μπορούν να μείνουν κενά

### **3. Πρόσεξε τη Μορφοποίηση**
- **Αριθμοί**: Χωρίς κόμματα (π.χ. `100.50` όχι `100,50`)
- **URLs**: Πλήρης διεύθυνση με `https://`
- **Κείμενο**: Χωρίς εισαγωγικά (εκτός αν υπάρχει κόμμα μέσα)

### **4. Αποθήκευσε ως CSV**
- File → Save As
- Επίλεξε: **CSV (Comma delimited) (*.csv)**
- Αποθήκευσε με όνομα π.χ. `My_Products_2025.csv`

---

## 🚀 Πώς να Φορτώσεις στο Σύστημα

### **Α. Στο Invoice Creator**:
1. Άνοιξε `invoices-creator.html`
2. Κλικ στο κουμπί **"📤 Upload Products from CSV"**
3. Επίλεξε το CSV αρχείο σου
4. Τα προϊόντα φορτώνονται αυτόματα στο grid!

### **Β. Στο Products Library**:
1. Άνοιξε `products-library.html`
2. Κλικ στο κουμπί **"📤 Import from CSV"**
3. Επίλεξε το CSV αρχείο σου
4. Τα προϊόντα αποθηκεύονται στη βάση!

---

## 💡 Tips & Tricks

### **Tip 1: Copy από Προμηθευτή**
Αν έχεις Excel από προμηθευτή:
1. Copy τις στήλες που ταιριάζουν
2. Paste στο template
3. Συμπλήρωσε τις υπόλοιπες στήλες

### **Tip 2: Bulk Calculations**
Στο Excel μπορείς να κάνεις formulas:
```excel
=E2*F2  (για Total QTY = CTN × QTY/CTN)
=K2*(1+M2/100)/L2  (για Unit Price από CNY)
```

### **Tip 3: Image URLs**
- Χρησιμοποίησε postimg.cc, imgur.com ή imgbb.com
- Upload τις εικόνες σου
- Copy το direct link
- Paste στο template

### **Tip 4: Validation**
Πριν upload, τσέκαρε:
- ✅ Όλες οι υποχρεωτικές στήλες συμπληρωμένες
- ✅ Αριθμοί σε σωστή μορφή (χωρίς κόμματα)
- ✅ URLs ξεκινούν με `https://`
- ✅ Καμία κενή γραμμή στη μέση

---

## ⚠️ Συνήθη Λάθη

### **❌ Λάθος**:
```csv
1,image.jpg,LED,,100,"500",3,50,,,100,00,7,8,25
```
**Προβλήματα**:
- URLs χωρίς `https://`
- Κενό Description (καλύτερα να υπάρχει κάτι)
- Αριθμοί με κόμματα (`3,50` αντί `3.50`)

### **✅ Σωστό**:
```csv
1,https://example.com/image.jpg,LED Bulb,220V Warm White,100,500,3.50,https://1688.com/led,https://example.com/image.jpg,Standard,100.00,7.8,25
```

---

## 🔄 Auto-Calculations

Όταν φορτώσεις τα προϊόντα, το σύστημα θα υπολογίσει αυτόματα:
- ✅ **Total QTY** = CTN × QTY per CTN
- ✅ **Total Price** = Total QTY × Unit Price EUR
- ✅ **Grand Total** = Άθροισμα όλων

---

## 📚 Παραδείγματα Χρήσης

### **Παράδειγμα 1: Φωτιστικά**
```csv
Item Number,Picture URL,Name,Description,CTN,QTY per CTN,Unit Price EUR,Product URL,Image URL,Notes,Price CNY,FX Rate,Markup %
1,https://i.postimg.cc/led1.jpg,LED Bulb E27 12W,Warm White 220V,100,500,3.50,https://1688.com/123,https://i.postimg.cc/led1.jpg,MOQ: 10k,100.00,7.8,25
2,https://i.postimg.cc/led2.jpg,LED Panel 60x60,Cool White 48W,50,20,25.00,https://1688.com/456,https://i.postimg.cc/led2.jpg,Dimmable,700.00,7.8,25
```

### **Παράδειγμα 2: Καλώδια**
```csv
Item Number,Picture URL,Name,Description,CTN,QTY per CTN,Unit Price EUR,Product URL,Image URL,Notes,Price CNY,FX Rate,Markup %
1,https://i.postimg.cc/cable1.jpg,USB-C Cable 1m,Nylon Braided Fast Charge,200,1000,1.20,https://1688.com/789,https://i.postimg.cc/cable1.jpg,Black/White,35.00,7.8,25
2,https://i.postimg.cc/cable2.jpg,HDMI Cable 2m,4K 60Hz Gold Plated,100,500,2.50,https://1688.com/012,https://i.postimg.cc/cable2.jpg,Version 2.0,75.00,7.8,25
```

---

## 🎯 Workflow Σύστασης

### **Για Νέα Προϊόντα**:
1. Δημιούργησε Excel με νέα προϊόντα
2. Upload στο **Products Library** (αποθήκευση στη βάση)
3. Στο **Invoice Creator**, χρησιμοποίησε autocomplete

### **Για Γρήγορο Invoice**:
1. Δημιούργησε Excel με προϊόντα του συγκεκριμένου invoice
2. Upload κατευθείαν στο **Invoice Creator**
3. Τα προϊόντα θα σωθούν αυτόματα στη βάση όταν κάνεις Save

---

## 📞 Βοήθεια

Αν αντιμετωπίσεις πρόβλημα:
1. Άνοιξε Browser Console (F12)
2. Δες τα error messages
3. Τσέκαρε ότι το CSV είναι σωστό
4. Δοκίμασε με το παράδειγμα template πρώτα

---

## ✅ Checklist Ελέγχου

Πριν upload:
- [ ] Headers ακριβώς όπως στο template
- [ ] Υποχρεωτικά πεδία συμπληρωμένα (Name, CTN, QTY per CTN, Unit Price)
- [ ] Αριθμοί με τελεία (όχι κόμμα): `3.50`
- [ ] URLs με `https://`
- [ ] Καμία κενή γραμμή
- [ ] Αποθηκευμένο ως CSV UTF-8

---

**Έτοιμο για χρήση!** 🚀

Κατέβασε το `INVOICE_PRODUCTS_TEMPLATE.csv`, συμπλήρωσέ το και φόρτωσέ το στο σύστημα!
