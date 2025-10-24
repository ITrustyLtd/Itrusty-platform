# Phase 7.2 - Multiple Critical Fixes Required

**Date**: May 2025  
**Status**: 🚧 IN PROGRESS  
**Reporter**: Johny (CEO)

---

## 🚨 Issues Reported by User (Greek Original)

**Johny's Report**:
> "Σήμερα είναι 13 του μήνα κι αν πάω στην 14η μέρα του μήνα βλέπω ξανά τα ίδια activity ενώ κάποιου έχει συμπληρωθεί και ως ολοκληρωμένο. Αυτό δεν πρέπει να συμβαίνει. Σε κάθε ημέρα πρέπει να φαίνονται μόνο τα activity εκείνης της ημέρας. Επιπλέον, δεν μπορώ να επεξεργαστώ όταν κάνω κλικ επάνω σε ένα task το οποίο εμφανίζεται επάνω στο ημερολόγιο στην πρώτη σελίδα δεν μπορώ να το ανοίξω συγκεκριμένα αυτά τα οποία είναι με γκρι χρώμα. Αυτό που καταλαβαίνω είναι ότι δεν είναι συνδεμένα τα tasks με τα daily activity, επίσης όταν ανοίγω την καρτέλα για παράδειγμα του Johnny που έχει δύο τακ όταν πατάω πάνω σε αυτά δεν μπορούν να ανοίξουν για να τα επεξεργαστώ."

**Additional Requirements**:
> "Επίσης όταν ανοίγουμε το παράθυρο με τα daily activity... θα ήθελα να υπάρχει δυνατότητα αυτό το παράθυρο το αναδυόμενο να έχει την λειτουργία να αλλάζεις ημέρες ημερομηνίες και να ανατρέχεις μέσα σε αυτό το παράθυρο το αναδυόμενο σε μια άλλη ημερομηνία όπως επίσης και να υπάρχει φιλτράρισμα εκεί πέρα που λέει αριστερά στο μπλε το κουμπί όπου λέει all, όταν πατάς ένα από τα διπλανά του κουμπιά, για παράδειγμα, new requests, inspections, shipments, quality, control, checks, payments, meetings, I would like all to be filtered accurately and be interconnected. Πέρασα αρκετές πληρωμές στο customer invoices, σήμερα αλλά δεν φαίνονται. Θα ήθελα να είναι άμεσα συνδεδεμένο ημερομηνία κακά αλλά και λογιστικά με οτιδήποτε συναφές δηλαδή με το financial management customer invoices supplier payments, profit analysis."

---

## 📋 Issues Breakdown

### **Issue 1: Daily Activities Show Same Data on Different Dates** ❌
**Status**: ✅ FIXED (Partial)

**Problem**:
- Clicking October 13 shows activities
- Clicking October 14 shows **same activities**
- Even completed activities reappear on future dates

**Root Cause**:
```javascript
// index.html line 1406 (BEFORE FIX)
const response = await fetch(`tables/daily_activities?search=${dateStr}`);
```
The `search` parameter searches ALL fields (title, description, notes, customer_code, etc.), not just `activity_date`. So if "ship out the samples of DAM" contains "14" in title/notes, it shows on Oct 14 too!

**Fix Applied**:
```javascript
// ✅ FIXED - Now filters by exact date match
activities = activities.filter(activity => {
    if (!activity.activity_date) return false;
    const activityDate = activity.activity_date.split('T')[0];
    return activityDate === dateStr;
});

// Also exclude completed activities from future dates
activities = activities.filter(activity => {
    return activity.status !== 'completed' || activity.activity_date.split('T')[0] === dateStr;
});
```

---

### **Issue 2: Gray Tasks on Calendar Don't Open** ❌
**Status**: 🚧 NOT YET FIXED

**Problem**:
- Clicking **gray tasks** (completed) on calendar shows "Error loading task data"
- Green/blue tasks work fine (fixed in Phase 7.1)
- Only gray (completed) tasks fail

**Root Cause** (HYPOTHESIS):
Completed tasks might have different data structure or missing `id` field.

**Investigation Needed**:
1. Check what data `extendedProps.data` contains for gray tasks
2. Verify `data.id` exists
3. Add console logging in handleEventClick

**Proposed Fix**:
```javascript
// js/app.js line 211
handleEventClick(info) {
    const event = info.event;
    const data = event.extendedProps.data;
    const type = event.extendedProps.type;
    
    console.log('Event clicked:', { type, data }); // DEBUG
    
    if (type === 'project') {
        this.showProjectDetails(data);
    } else if (type === 'task') {
        if (!data || !data.id) {
            console.error('Task data missing ID:', data);
            alert('Error: Task data incomplete');
            return;
        }
        this.showTaskDetails({ id: data.id });
    }
}
```

---

### **Issue 3: Staff Modal (Johnny) Tasks Don't Open** ❌
**Status**: 🚧 NOT YET FIXED

**Problem**:
- Click Johnny's card → Staff modal opens with his tasks
- Click on any of Johnny's tasks → Nothing happens or error
- Expected: Edit Task modal should open

**Root Cause** (HYPOTHESIS):
Similar to Issue 2 - onclick handler or data structure problem

**Investigation Needed**:
1. Find where Johnny's tasks are rendered
2. Check onclick attribute value
3. Verify if it calls correct function

**Likely Location**:
```javascript
// js/app.js line 713 (showStaffTasksModal)
<div onclick="window.openEditTaskModal('${task.id}')">
```

**Verification**:
- Is `window.openEditTaskModal` defined? ✅ YES (from task-sync.js)
- Does `task.id` exist and have correct value? ❓ NEED TO CHECK

---

### **Issue 4: Daily Activities Modal Needs Date Navigation** ❌
**Status**: 🚧 NOT YET STARTED

**Requirement**:
User wants to navigate between dates **without closing the modal**.

**Current Flow** (BAD):
1. Click Oct 13 → Modal opens showing Oct 13 activities
2. Want to see Oct 14 → Must close modal
3. Click Oct 14 → Modal opens again

**Desired Flow** (GOOD):
1. Click Oct 13 → Modal opens
2. Click "Next Day" button in modal → Shows Oct 14 activities
3. Click "Previous Day" → Shows Oct 13 activities
4. Stay in same modal, just change date

**Implementation Plan**:
```html
<!-- Add to modal header -->
<div class="flex items-center justify-between">
    <button onclick="navigateToPreviousDay()" class="btn">
        <i class="fas fa-chevron-left"></i> Previous Day
    </button>
    
    <h3 id="modalDateDisplay">Monday, October 13, 2025</h3>
    
    <button onclick="navigateToNextDay()" class="btn">
        Next Day <i class="fas fa-chevron-right"></i>
    </button>
</div>
```

```javascript
function navigateToPreviousDay() {
    const current = new Date(currentSelectedDate);
    current.setDate(current.getDate() - 1);
    const newDateStr = current.toISOString().split('T')[0];
    currentSelectedDate = newDateStr;
    
    // Update display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('modalDateDisplay').textContent = current.toLocaleDateString('en-US', options);
    
    // Reload activities
    loadDailyActivities(newDateStr);
}

function navigateToNextDay() {
    const current = new Date(currentSelectedDate);
    current.setDate(current.getDate() + 1);
    const newDateStr = current.toISOString().split('T')[0];
    currentSelectedDate = newDateStr;
    
    // Update display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('modalDateDisplay').textContent = current.toLocaleDateString('en-US', options);
    
    // Reload activities
    loadDailyActivities(newDateStr);
}
```

---

### **Issue 5: Activity Type Filters Don't Work Properly** ❌
**Status**: 🚧 PARTIALLY FIXED

**Problem**:
- Blue "All" button works
- Other buttons (New Requests, Inspections, Shipments, QC Checks, Payments, Meetings) don't filter correctly

**Current Code**:
```javascript
// index.html line 1412-1414
if (currentActivityFilter !== 'all') {
    activities = activities.filter(a => a.activity_type === currentActivityFilter);
}
```

**Issue**: 
Button values might not match database values. For example:
- Button says "New Requests"
- Database has `activity_type: "new_request"` (underscore, lowercase)

**Proposed Fix**:
```javascript
function filterActivities(type) {
    currentActivityFilter = type;
    
    console.log('Filtering by type:', type); // DEBUG
    
    // Update button styles
    document.querySelectorAll('.activity-filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'active');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    event.target.closest('button').classList.remove('bg-gray-200', 'text-gray-700');
    event.target.closest('button').classList.add('bg-blue-600', 'text-white', 'active');
    
    // Reload activities with filter
    loadDailyActivities(currentSelectedDate);
}
```

**Verify Button Values**:
```html
<button onclick="filterActivities('all')">All</button>
<button onclick="filterActivities('new_request')">New Requests</button>
<button onclick="filterActivities('inspection')">Inspections</button>
<button onclick="filterActivities('shipment')">Shipments</button>
<button onclick="filterActivities('qc_check')">QC Checks</button>
<button onclick="filterActivities('payment')">Payments</button>
<button onclick="filterActivities('meeting')">Meetings</button>
```

---

### **Issue 6: Financial Data Not Integrated with Daily Activities** ❌
**Status**: 🚧 NOT YET STARTED

**Requirement**:
"Πέρασα αρκετές πληρωμές στο customer invoices, σήμερα αλλά δεν φαίνονται."

User creates customer payment → Should appear in Daily Activities as "Payment" type activity.

**Current Situation**:
- Customer Invoices system: `transactions-customers.html`
- Supplier Payments system: `transactions-suppliers.html`
- Daily Activities system: `index.html` Daily Activities modal
- **NO CONNECTION BETWEEN THEM**

**Implementation Plan**:

**Option A: Auto-Create Activity When Payment Added**
```javascript
// In transactions-customers.html (after adding customer payment)
async function addCustomerPayment(paymentData) {
    // Save payment
    const response = await fetch('tables/customer_transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    });
    
    if (response.ok) {
        // ✅ Also create daily activity
        const activityData = {
            activity_type: 'payment',
            activity_date: paymentData.payment_date,
            title: `Payment Received: ${paymentData.customer_code}`,
            description: `Customer payment of ${paymentData.currency} ${paymentData.amount}`,
            customer_code: paymentData.customer_code,
            related_order_id: paymentData.invoice_number,
            office: 'Finance',
            status: 'completed',
            priority: 'medium',
            notes: `Received via ${paymentData.payment_method} to ${paymentData.bank_account}`
        };
        
        await fetch('tables/daily_activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
        });
    }
}
```

**Option B: Fetch Payments in Daily Activities**
```javascript
// In loadDailyActivities() function
async function loadDailyActivities(dateStr) {
    // Load regular activities
    const activitiesResponse = await fetch(`tables/daily_activities`);
    let activities = activitiesResponse.data || [];
    
    // ✅ Also load customer payments for this date
    const paymentsResponse = await fetch(`tables/customer_transactions`);
    const payments = paymentsResponse.data || [];
    
    const paymentsForDate = payments.filter(p => {
        return p.payment_date && p.payment_date.split('T')[0] === dateStr;
    });
    
    // Convert payments to activity format
    const paymentActivities = paymentsForDate.map(p => ({
        id: `payment_${p.id}`,
        activity_type: 'payment',
        title: `Payment: ${p.customer_code}`,
        description: `${p.currency} ${p.amount}`,
        customer_code: p.customer_code,
        status: 'completed',
        priority: 'medium',
        notes: `Payment via ${p.payment_method}`
    }));
    
    // Merge
    activities = [...activities, ...paymentActivities];
}
```

**Recommendation**: Option A (Auto-create) is better because:
- Payment data is stored in dedicated activity record
- Can track who logged the payment, when, etc.
- Consistent with other activity types

---

## 🔧 Implementation Priority

### **Phase 7.2.1 - Critical Fixes (HIGH PRIORITY)** 🔴
1. ✅ **DONE**: Fix date filtering (completed activities issue)
2. 🚧 **IN PROGRESS**: Fix gray task clicks on calendar
3. 🚧 **IN PROGRESS**: Fix Staff modal task clicks (Johnny)

### **Phase 7.2.2 - UX Improvements (MEDIUM PRIORITY)** 🟡
4. ⏳ **PENDING**: Add date navigation to Daily Activities modal
5. ⏳ **PENDING**: Fix activity type filter buttons

### **Phase 7.2.3 - Integration (MEDIUM PRIORITY)** 🟡
6. ⏳ **PENDING**: Integrate Customer Payments with Daily Activities
7. ⏳ **PENDING**: Integrate Supplier Payments with Daily Activities

---

## 📁 Files That Need Changes

### **1. index.html**
**Changes Needed**:
- ✅ DONE: Fix `loadDailyActivities()` date filtering (line 1400)
- Add date navigation buttons to Daily Activities modal header
- Verify activity filter button onclick values
- Add financial data loading to `loadDailyActivities()`

### **2. js/app.js**
**Changes Needed**:
- Add error handling in `handleEventClick()` for missing task IDs
- Add console logging for debugging
- Fix Staff modal task onclick handlers (line 713)

### **3. transactions-customers.html**
**Changes Needed**:
- Add daily activity creation when customer payment added
- Link to daily_activities table

### **4. transactions-suppliers.html**
**Changes Needed**:
- Add daily activity creation when supplier payment added
- Link to daily_activities table

---

## 🧪 Testing Plan

### **Test 1: Date Filtering** ✅
1. Create activity for Oct 13 with status "in_progress"
2. Create activity for Oct 14 with status "completed"
3. Click Oct 13 on calendar → Should show only Oct 13 activity
4. Click Oct 14 → Should show Oct 14 activity (completed)
5. Click Oct 15 → Should show Oct 14 activity (in_progress carries forward)
6. Should NOT show Oct 13 activity on Oct 14 ✅

### **Test 2: Gray Task Clicks** ⏳
1. Create task with status "Completed" (gray on calendar)
2. Click gray task event
3. Should open Edit Task modal
4. Should NOT show error

### **Test 3: Staff Modal Tasks** ⏳
1. Click Johnny's card
2. Staff modal shows his 4 tasks
3. Click any task
4. Edit Task modal should open
5. Should load task data

### **Test 4: Date Navigation** ⏳
1. Click Oct 13 → Daily Activities modal opens
2. Click "Next Day" button → Shows Oct 14
3. Click "Previous Day" → Shows Oct 13
4. Modal stays open throughout

### **Test 5: Activity Filters** ⏳
1. Create activities of different types (payment, shipment, meeting)
2. Click "All" → Shows all activities
3. Click "Payments" → Shows only payment activities
4. Click "Shipments" → Shows only shipments
5. Filters work correctly

### **Test 6: Financial Integration** ⏳
1. Add customer payment for Oct 13 with amount €5000
2. Click Oct 13 → Daily Activities modal opens
3. Should see payment activity: "Payment Received: CUSTOMER_CODE"
4. Click on it → Shows payment details
5. Status should be "completed"

---

## 📝 Notes

**User Quote**:
> "Σε παρακαλώ διόρθωσέ όλες αυτές τις μικρές πλην όμως σημαντικές λεπτομέρειες."

These are NOT small details - they are **critical workflow issues** affecting daily use!

**Impact**:
- Users can't see correct activities for each day
- Users can't edit tasks from multiple entry points
- Financial data is disconnected from daily operations

**Expected Resolution Time**:
- Phase 7.2.1: 2 hours (critical fixes)
- Phase 7.2.2: 1 hour (UX improvements)
- Phase 7.2.3: 2 hours (financial integration)
- **Total**: ~5 hours of focused work

---

**Status**: 🚧 Work in progress  
**Next Action**: Fix gray task clicks + Staff modal task clicks  
**Blocked**: Need to find Daily Activities modal HTML structure for date navigation buttons
