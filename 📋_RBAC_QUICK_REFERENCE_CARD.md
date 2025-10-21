# 📋 RBAC SYSTEM - QUICK REFERENCE CARD

## 🔑 **DEMO ACCOUNTS**

```
┌──────────────┬─────────────────────────┬─────────────┬───────────┐
│ User         │ Email                   │ Password    │ Role      │
├──────────────┼─────────────────────────┼─────────────┼───────────┤
│ johny        │ ioannis@itrusty.com     │ admin123    │ Admin     │
│ lily         │ lily@itrusty.com        │ lily123     │ Manager   │
│ peng         │ peng@itrusty.com        │ peng123     │ Manager   │
│ ruby         │ ruby@itrusty.com        │ ruby123     │ Staff     │
│ bigbrother   │ zheng@itrusty.com       │ bb123       │ Staff     │
│ nikos        │ nikos@itrusty.com       │ nikos123    │ Manager   │
│ chrysanthi   │ chrysanthi@itrusty.com  │ chrys123    │ Manager   │
└──────────────┴─────────────────────────┴─────────────┴───────────┘
```

**Login**: Use **Email OR Username** + Password

---

## 🚪 **KEY PAGES**

```
┌─────────────────────────────┬────────────────────────────────────┐
│ Page                        │ What It Does                       │
├─────────────────────────────┼────────────────────────────────────┤
│ login.html                  │ Login (email or username)          │
│ admin-sessions.html         │ See who's online + session stats   │
│ admin-permissions.html      │ Manage user permissions + passwords│
│ customers.html              │ Customer list (filtered by access) │
│ index.html                  │ Main dashboard                     │
└─────────────────────────────┴────────────────────────────────────┘
```

---

## 🎯 **COMMON TASKS**

### **1. Setup Ruby with 4 Customers Only**
```
1. Login: johny / admin123
2. Go to: admin-permissions.html
3. Click: "Edit" on Ruby Liu card
4. Scroll to: "Customer Access"
5. Select ONLY:
   ☑️ SRP
   ☑️ CTC  
   ☑️ IRED
   ☑️ AMD
6. Click: "Save Permissions"
7. Done! Ruby now sees only these 4 customers
```

### **2. View Active Sessions**
```
1. Login: johny / admin123
2. Go to: Settings → Active Sessions
3. See: Real-time dashboard with all logged users
4. Auto-refreshes: Every 30 seconds
```

### **3. Reset User Password**
```
1. Login: johny / admin123
2. Go to: admin-permissions.html
3. Click: "Edit" on user card
4. Scroll to: "Password Management"
5. View current: Click eye icon
6. Reset: Enter new password → Click "Reset"
7. Done! User can now login with new password
```

### **4. Check Session Duration**
```
1. Login: johny / admin123
2. Go to: admin-sessions.html
3. See: Duration column shows minutes since login
4. Colors:
   - 🟢 Green = Active (< 5 min)
   - 🟠 Orange = Idle (5-30 min)
   - 🔴 Red = Inactive (> 30 min)
```

### **5. Logout**
```
1. Click: Settings (⚙️)
2. Click: Logout
3. Done! Session cleared, redirected to login
```

---

## 🔐 **PERMISSION LEVELS**

```
┌──────────────┬───────────────┬──────────────┬─────────────────┐
│ Role         │ Page Access   │ Customers    │ Financials      │
├──────────────┼───────────────┼──────────────┼─────────────────┤
│ Admin        │ ALL           │ ALL          │ FULL ACCESS     │
│ Manager      │ Most pages    │ ALL or Set   │ VIEW ONLY       │
│ Staff        │ Limited       │ Set List     │ NO ACCESS       │
│ Limited      │ Very Limited  │ Few only     │ NO ACCESS       │
└──────────────┴───────────────┴──────────────┴─────────────────┘
```

---

## 📊 **DATABASE TABLES USED**

```
┌──────────────────────┬────────┬─────────────────────────────────┐
│ Table                │ Fields │ Purpose                         │
├──────────────────────┼────────┼─────────────────────────────────┤
│ users                │ 16     │ User accounts, emails, passwords│
│ user_permissions     │ 16     │ Roles, page/customer access     │
│ audit_log            │ 13     │ Login history, session tracking │
└──────────────────────┴────────┴─────────────────────────────────┘
```

---

## 🛠️ **FILES CREATED**

```javascript
// Session Management
js/session-tracker.js           // Tracks login time, duration, activity

// Access Control
js/page-protection.js           // Validates permissions, filters customers

// Admin Dashboards
admin-sessions.html             // Real-time session monitoring

// Modified
login.html                      // Email + username login
admin-permissions.html          // Added password management
components/navigation.html      // Logout button + admin links
customers.html                  // Customer filtering applied
index.html                      // Page protection applied
```

---

## ⚡ **QUICK COMMANDS**

### **JavaScript - Get Current User**
```javascript
// Get current logged-in user
const user = SessionTracker.getCurrentSessionUser();
console.log(user.full_name, user.email, user.role);

// Get session duration
const minutes = SessionTracker.getSessionDuration();
console.log(`Logged in for ${minutes} minutes`);
```

### **JavaScript - Check Permissions**
```javascript
// Check page access
const hasAccess = await PageProtection.checkPageAccess('analytics');

// Filter customers
const filtered = await PageProtection.filterCustomersByPermission(allCustomers);

// Check specific permissions
if (PageProtection.canViewFinancials()) {
    // Show financial data
}

if (PageProtection.canDeleteRecords()) {
    // Show delete button
}
```

### **JavaScript - Log User Action**
```javascript
// Log important action to audit_log
SessionTracker.logUserAction(
    'edit',           // action_type
    'invoice',        // resource_type
    'INV-001',        // resource_id
    'Updated total'   // details
);
```

---

## 🎨 **UI ELEMENTS**

### **Navigation - Admin Links**
```
Settings (⚙️)
├─ Language
├─ Theme
├─ User Permissions (ADMIN) ← Red badge
├─ Active Sessions (ADMIN)  ← Red badge
└─ Logout                   ← Exit icon
```

### **Admin Permissions - Customer Access**
```
┌─────────────────────────────────────────┐
│ 👥 Customer Access                      │
│ Leave empty for full access, or select  │
├─────────────────────────────────────────┤
│ ☑️ SRP     ☑️ CTC      ☐ GLOBAL SAT    │
│ ☑️ IRED    ☑️ AMD      ☐ HOTEL CHAIN   │
│ ☐ MONDSUB  ☐ SILUAN   ☐ CHURCH        │
└─────────────────────────────────────────┘
```

### **Sessions Dashboard - Status Colors**
- 🟢 **Green Circle**: Active (< 5 min inactive)
- 🟠 **Orange Clock**: Idle (5-30 min inactive)
- 🔴 **Red X**: Inactive (> 30 min - auto-logout)

---

## 🔒 **SECURITY FEATURES**

```
✅ 30-minute inactivity timeout
✅ Unique session IDs (sess_timestamp_random)
✅ Password visibility toggle (admin only)
✅ Audit logging (all login/logout events)
✅ Customer filtering (array-based)
✅ Page-level access control
✅ Financial data masking
✅ Session cleanup on logout
```

---

## 📱 **NAVIGATION PATHS**

```
Settings → Active Sessions    = admin-sessions.html
Settings → User Permissions   = admin-permissions.html
Settings → Logout             = Clears session → login.html

Financial → Analytics         = analytics-dashboard.html
CRM → Customers               = customers.html (filtered)
```

---

## 🎯 **5-MINUTE TEST CHECKLIST**

```
☐ 1. Login with email (lily@itrusty.com / lily123)
☐ 2. Check Sessions Dashboard (Settings → Active Sessions)
☐ 3. View Ruby's password (admin-permissions.html → Edit Ruby)
☐ 4. Setup Ruby with 4 customers (SRP, CTC, IRED, AMD)
☐ 5. Login as Ruby, verify she sees only 4 customers
☐ 6. Test logout button (Settings → Logout)
```

---

## 📞 **SUPPORT**

**Full Documentation:**
- `🔐_RBAC_SYSTEM_COMPLETE_MAY15.md` - Technical guide
- `🎉_JOHNY_ΔΙΑΒΑΣΕ_ΑΥΤΟ_ΠΡΩΤΑ_RBAC_🎉.md` - Quick start
- `README.md` - Project overview

**Key Principle:**
> "η ευελιξία της μεταβλητότητας όπου μπορεί να τηρηθεί, να τηρηθεί"
> (Flexibility and variability maintained everywhere possible)

**Customer Filtering:**
- NOT hardcoded
- Dynamic tick boxes
- Admin changes in 20 seconds
- Array-based storage

---

**Version**: 4.1.0  
**Status**: ✅ Production Ready  
**Date**: May 15, 2025
