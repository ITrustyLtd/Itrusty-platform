# 📥 CSV Templates - Download & Usage Guide

## 🎯 Available Templates

Έχεις **4 templates** έτοιμα για download:

---

## 1️⃣ Empty Template (Για Custom Data)

**File**: `📥_EMPTY_TEMPLATE.csv`

**Τι Περιέχει**:
- Headers (13 στήλες)
- 5 κενές γραμμές με default values
- FX Rate: 7.8 (current CNY/EUR)
- Markup: 25% (default)

**Χρησιμοποίησε το όταν**:
- Θέλεις να γράψεις τα δικά σου προϊόντα από την αρχή
- Χρειάζεσαι clean template χωρίς examples

---

## 2️⃣ Electronics Template (Sample Data)

**File**: `📥_SAMPLE_TEMPLATE_ELECTRONICS.csv`

**Τι Περιέχει**:
- **10 προϊόντα**: Electronics & Accessories
- LED Bulbs, USB Cables, Power Banks, Speakers, Smart Watches, etc.
- Realistic prices, quantities, descriptions
- MOQ notes, certifications, lead times

**Χρησιμοποίησε το όταν**:
- Δουλεύεις με electronics suppliers
- Θέλεις να δεις πώς μοιάζει ένα completed CSV
- Testing του upload feature

**Total Value**: €351,700.00 (για testing)

---

## 3️⃣ Siluan Orthodox Template (Premium)

**File**: `📥_SAMPLE_TEMPLATE_SILUAN_ORTHODOX.csv`

**Τι Περιέχει**:
- **15 προϊόντα**: Orthodox Christian Gifts
- Incense, Icons, Prayer Ropes, Crosses, Holy Oil Lamps
- Byzantine style descriptions
- Premium pricing (monastery quality)

**Ideal για**:
- **Siluan Project** development
- Monastery suppliers sourcing
- Tourist gift shop catalogs
- Online Orthodox store

**Product Categories**:
- 🕯️ Incense & Candles
- 📿 Prayer items (Ropes, Rosaries)
- ✝️ Icons & Crosses
- 🏺 Ceremonial items (Censers, Oil Lamps)
- 📖 Books & Study materials

**Total Value**: €354,950.00

---

## 4️⃣ Hotel Supplies Template (HORECA)

**File**: `📥_SAMPLE_TEMPLATE_HOTEL_SUPPLIES.csv`

**Τι Περιέχει**:
- **15 προϊόντα**: Hotel & Hospitality supplies
- Towels, Pillows, Bathrobes, Amenities
- Realistic hotel-grade specifications
- Bulk quantities, competitive pricing

**Ideal για**:
- Hotel clients (SRP, CTC, AMD)
- HORECA suppliers
- Bulk linen orders
- Guest amenities packages

**Product Categories**:
- 🛏️ Bedding (Sheets, Pillows, Towels)
- 🛁 Bathroom (Bathrobes, Slippers, Amenities)
- 🧴 Toiletries (Shampoo, Soap, Toothbrush kits)
- ⚡ Equipment (Hair Dryers, Kettles)
- 🪝 Accessories (Hangers, Tissue Holders)

**Total Value**: €268,600.00

---

## 📥 How to Download & Use

### **Step 1: Locate Files**
All templates are in your project root:
```
📁 Project Root/
├── 📥_EMPTY_TEMPLATE.csv
├── 📥_SAMPLE_TEMPLATE_ELECTRONICS.csv
├── 📥_SAMPLE_TEMPLATE_SILUAN_ORTHODOX.csv
└── 📥_SAMPLE_TEMPLATE_HOTEL_SUPPLIES.csv
```

### **Step 2: Download/Copy**
- **Option A**: Copy to your desktop
- **Option B**: Open in Excel/Google Sheets
- **Option C**: Keep in project folder

### **Step 3: Edit in Excel**
1. Open template in Microsoft Excel
2. Edit product data (keep column headers!)
3. Save As → **CSV (Comma delimited) (*.csv)**
4. Important: Choose UTF-8 encoding if prompted

### **Step 4: Upload to Invoice Creator**
1. Open `invoices-creator.html`
2. Click: **📤 Upload Products from CSV**
3. Select your edited CSV file
4. Verify products load correctly

---

## ✏️ How to Edit Templates

### **Basic Edits**:
```csv
Change This:
1,,LED Bulb,Description,100,500,3.50,...

To This:
1,,YOUR PRODUCT,YOUR DESCRIPTION,50,200,5.00,...
```

### **Adding More Rows**:
```csv
Copy last row:
15,...,Last Product,...

Paste and edit:
16,...,New Product,...
17,...,Another Product,...
```

### **Required Fields** (Don't leave empty):
- ✅ **Name** - Product name
- ✅ **Unit Price EUR** - Price in euros

### **Optional Fields** (Can be empty):
- Item Number (auto-fills if empty)
- Description
- CTN, QTY per CTN
- URLs (Product, Image)
- Notes
- Price CNY, FX Rate, Markup %

---

## 🎨 Customization Tips

### **1. Add Your Supplier URLs**
Replace placeholder URLs:
```csv
Product URL: https://1688.com/YOUR-ACTUAL-PRODUCT-LINK
Image URL: https://YOUR-SUPPLIER.com/image.jpg
```

### **2. Update Pricing**
Calculate from CNY:
```
Price CNY: 100.00
FX Rate: 7.8
Markup %: 25

Formula: (100 / 7.8) × 1.25 = €16.03
Unit Price EUR: 16.03
```

### **3. Add Custom Notes**
```csv
Notes: MOQ: 10000 pcs | Lead time: 15 days | CE certified | Custom color available
```

### **4. Bulk Quantities**
For large orders:
```csv
CTN: 200
QTY per CTN: 1000
Total QTY: 200,000 pcs
```

---

## 🧪 Testing Workflow

### **Test 1: Empty Template**
1. Download `📥_EMPTY_TEMPLATE.csv`
2. Add 3 products manually
3. Upload to invoice
4. Verify calculations

### **Test 2: Sample Template**
1. Download `📥_SAMPLE_TEMPLATE_ELECTRONICS.csv`
2. Upload without changes
3. Verify 10 products load
4. Check subtotal: €351,700.00

### **Test 3: Edit & Upload**
1. Open any sample template
2. Change prices/quantities
3. Add 2 new products
4. Upload and verify changes

---

## 📊 Template Comparison

| Template | Products | Value | Use Case |
|----------|----------|-------|----------|
| **Empty** | 0 (blank) | €0 | Custom data entry |
| **Electronics** | 10 | €351K | Tech suppliers |
| **Siluan Orthodox** | 15 | €355K | **Monastery gifts** |
| **Hotel Supplies** | 15 | €269K | HORECA clients |

---

## ⚠️ Common Mistakes to Avoid

### ❌ **Don't Do This**:
```csv
Name,Price  ← Wrong column names!
Product A,5.00

"Product, with commas",10  ← Use quotes correctly
```

### ✅ **Do This**:
```csv
Name,Unit Price EUR  ← Exact column names!
Product A,5.00

"Product, with commas",10.00  ← Proper quoting
```

### ❌ **Don't Save As**:
- Excel Workbook (.xlsx) ← Won't work directly
- Text file (.txt)
- Word document (.docx)

### ✅ **Save As**:
- **CSV (Comma delimited) (*.csv)** ← This works!

---

## 🔄 Update Workflow for Regular Use

### **Monthly Catalog Updates**:
```
1. Download current supplier catalog
2. Open your template (e.g., Electronics)
3. Update prices from supplier
4. Add new products
5. Remove discontinued items
6. Save as new CSV: "Catalog_May2025.csv"
7. Upload to create quotations
```

### **Customer-Specific Templates**:
```
📁 Templates/
├── SRP_Hotel_Supplies.csv
├── CTC_Electronics.csv
├── AMD_Custom_Products.csv
└── Siluan_Monastery_Gifts.csv
```

---

## 🎯 Real-World Examples

### **Example 1: Ruby's SRP Order**
```
1. Opens: 📥_SAMPLE_TEMPLATE_HOTEL_SUPPLIES.csv
2. Updates: Towel prices from Foshan supplier
3. Adds: 5 new pillow variants
4. Uploads: Creates quotation in 30 seconds
5. Result: Professional quote for SRP client
```

### **Example 2: Lily's Electronics Catalog**
```
1. Opens: 📥_SAMPLE_TEMPLATE_ELECTRONICS.csv
2. Updates: All prices from Shenzhen market
3. Adds: Latest smart watch models
4. Uploads: Instant catalog for European client
5. Result: Quick turnaround, happy client
```

### **Example 3: Johny's Siluan Launch**
```
1. Opens: 📥_SAMPLE_TEMPLATE_SILUAN_ORTHODOX.csv
2. Adds: 20 monastery products from suppliers
3. Updates: Premium pricing for retail
4. Uploads: Creates master product catalog
5. Result: Siluan store ready to launch!
```

---

## 📞 Support

**Questions about templates?**
- See: `📄_ΟΔΗΓΙΕΣ_TEMPLATE_ΠΡΟΪΟΝΤΩΝ.md` (Greek guide)
- See: `🧪_CSV_UPLOAD_TESTING_GUIDE.md` (Testing guide)
- See: `🚀_QUICK_START_CSV_UPLOAD.md` (Quick start)

**Need custom template?**
- Copy any existing template
- Modify to your needs
- Keep column structure!

---

## ✅ Pre-Upload Checklist

Before uploading any CSV:

- [ ] File saved as `.csv` format
- [ ] Column names match template exactly
- [ ] "Name" column not empty
- [ ] "Unit Price EUR" column not empty
- [ ] Numbers use `.` for decimals (not `,`)
- [ ] No extra commas in text fields (or use quotes)
- [ ] FX Rate is current (7.8 for CNY/EUR)
- [ ] Opened file in Excel once to verify

---

## 🎉 Ready to Go!

**You now have**:
- ✅ 4 professional templates
- ✅ Sample data for 3 business categories
- ✅ Empty template for custom use
- ✅ Complete usage guide

**Start with**:
1. `📥_SAMPLE_TEMPLATE_ELECTRONICS.csv` - Test upload
2. `📥_EMPTY_TEMPLATE.csv` - Create your first custom catalog
3. `📥_SAMPLE_TEMPLATE_SILUAN_ORTHODOX.csv` - Launch Siluan! 🕯️

---

**Created**: May 15, 2025  
**Updated**: May 15, 2025  
**Status**: ✅ Ready for Download & Use  
**Version**: 3.3.0

**Download, edit, upload - και έτοιμος!** 🚀
