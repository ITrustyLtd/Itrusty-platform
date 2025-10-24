# 🗺️ **ΠΩΣ ΝΑ ΒΡΕΙΣ ΤΟ CUSTOMERS MANAGEMENT SYSTEM**

## 📍 **ΒΗΜΑ-ΠΡΟΣ-ΒΗΜΑ ΟΔΗΓΙΕΣ**

### **Μέθοδος 1: Από το Dashboard (ΣΥΝΙΣΤΑΤΕ)**

1. **Άνοιξε το dashboard:**
   ```
   https://www.genspark.ai/api/code_sandbox_light/preview/66d3d8b5-59a6-491e-bf3d-7a42f48850f7/index.html
   ```

2. **Κοίτα στο header** (πάνω δεξιά του "I Trusty Project Timeline Manager")

3. **Θα δεις μια **γραμμή από μικρά χρωματιστά icons**:
   ```
   Row 1 (5 icons):
   🟣 Projects | 🟠 Orders | 🟣 Daily Activities | 🔴 Orders & Workflow | 🔵 Team
   
   Row 2 (5 icons):
   🟢 Suppliers | 🟢 Finance | 🔴 Orders System | 🟡 Balance Summary | 💜💗 Customers ⭐
   ```

4. **Το 10ο icon** (κάτω δεξιά) είναι το **Customers** με:
   - 💜💗 **Purple-pink gradient** background
   - 👔 **User-tie icon** (άνθρωπος με γραβάτα)

5. **Hover over** το icon → Θα εμφανιστεί το text "**Customers**"

6. **Click** → Θα ανοίξει το customers.html! 🎉

---

### **Μέθοδος 2: Direct URL**

Απλά άλλαξε το τέλος του URL από `index.html` σε `customers.html`:

**BEFORE:**
```
https://www.genspark.ai/api/code_sandbox_light/preview/66d3d8b5-59a6-491e-bf3d-7a42f48850f7/index.html
```

**AFTER:**
```
https://www.genspark.ai/api/code_sandbox_light/preview/66d3d8b5-59a6-491e-bf3d-7a42f48850f7/customers.html
```

---

## ✅ **ΤΙ ΘΑ ΔΕΙΣ ΟΤΑΝ ΜΠΕΙΣ:**

### **1. Loading Screen (2-3 seconds)**
- Spinner με text "Loading customers..."
- Το σύστημα τραβάει data από Google Sheets

### **2. Main Dashboard**
Θα δεις:
- **4 Stat Cards** (Total Customers, Orders, Revenue, Avg Order Value)
- **2 Charts** (Top 10 Customers bar chart, Countries doughnut chart)
- **Filter Section** με dropdown για Country, City, Status + Search box
- **Grid/List toggle buttons**
- **Customer Cards** σε grid layout

### **3. Customer Profile Modal**
Click σε οποιονδήποτε customer card:
- **Modal window** θα ανοίξει
- **4 Tabs** στο κάτω μέρος:
  - 📦 **Orders History** - Όλες οι παραγγελίες
  - 💰 **Payments Received** - Deposit/Balance breakdown
  - 🏭 **Supplier Costs** - Linked supplier payments + profit margins
  - 📊 **Analytics** - Charts, trends, top products

---

## 🧪 **ΔΟΚΙΜΗ (TEST CHECKLIST)**

Για να επιβεβαιώσεις ότι όλα δουλεύουν:

### **✅ Step 1: Navigation**
- [ ] Βρες το 10ο icon (purple-pink με 👔)
- [ ] Hover → Δες "Customers" text
- [ ] Click → Ανοίγει customers.html

### **✅ Step 2: Data Loading**
- [ ] Δες loading spinner
- [ ] Μετά από 2-3 δευτερόλεπτα φορτώνουν customers
- [ ] Stat cards δείχνουν νούμερα (όχι 0)
- [ ] Charts εμφανίζονται

### **✅ Step 3: Filters**
- [ ] Δοκίμασε search box (πληκτρολόγησε customer name)
- [ ] Δοκίμασε Country dropdown
- [ ] Δοκίμασε Grid/List toggle

### **✅ Step 4: Customer Profile**
- [ ] Click σε έναν customer card
- [ ] Modal ανοίγει με customer info
- [ ] Click "Orders History" tab → Δες orders
- [ ] Click "Payments Received" tab → Δες deposit/balance
- [ ] Click "Supplier Costs" tab → Δες supplier payments + margins
- [ ] Click "Analytics" tab → Δες 2 charts (doughnut + line)

### **✅ Step 5: Export**
- [ ] Click "Export Excel" → Κατεβαίνει .xlsx file
- [ ] Click "Export PDF" → Κατεβαίνει .pdf file

### **✅ Step 6: Back to Dashboard**
- [ ] Click "Dashboard" button (πάνω δεξιά, γκρι)
- [ ] Επιστρέφεις στο index.html

---

## 🆘 **TROUBLESHOOTING**

### **Πρόβλημα 1: Δεν βλέπω το Customers icon**
- **Λύση:** Κάνε refresh την σελίδα (F5 ή Ctrl+R)
- Το icon είναι στο **2ο row, τελευταίο δεξιά**

### **Πρόβλημα 2: Δεν φορτώνουν customers**
- **Λύση:** Check console (F12) για errors
- Πιθανό: Google Sheets API key issue
- Temporary: Θα δει "No customers found"

### **Πρόβλημα 3: Modal δεν ανοίγει**
- **Λύση:** Ensure JavaScript enabled
- Check console για errors

### **Πρόβλημα 4: Charts δεν εμφανίζονται**
- **Λύση:** Chart.js CDN issue - Reload page
- Check internet connection

---

## 📊 **VISUAL LAYOUT MAP**

```
┌─────────────────────────────────────────────────────────────────┐
│  I Trusty Project Timeline Manager               [Theme]        │
│                                                                   │
│  Navigation Tabs:                                                │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐          [New Project] [New Task] [View]  │
│  │🟣│ │🟠│ │🟣│ │🔴│ │🔵│                                        │
│  └─┘ └─┘ └─┘ └─┘ └─┘                                            │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌──┐                                           │
│  │🟢│ │🟢│ │🔴│ │🟡│ │💜│ ← **CUSTOMERS (10th icon)**           │
│  └─┘ └─┘ └─┘ └─┘ └──┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **SUMMARY**

**Το Customers Management System βρίσκεται:**
- 🏠 **From Dashboard:** 10ο navigation icon (purple-pink gradient, bottom-right)
- 🔗 **Direct URL:** Change `index.html` → `customers.html`
- 🔙 **Back:** Click "Dashboard" button στο header

**Όλα τα features λειτουργούν:**
- ✅ Google Sheets sync
- ✅ 4 tabs με real data
- ✅ Filters & search
- ✅ Charts
- ✅ Export Excel/PDF
- ✅ Profit margin calculations

**Έτοιμο για χρήση!** 🚀
