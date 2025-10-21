# 🔍 Messaging System - Complete Troubleshooting Guide

## Quick Diagnostic Chart

```
┌─────────────────────────────────────────┐
│  SYMPTOM: Message shows wrong sender   │
└──────────────┬──────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Check Console (F12)  │
    └──────────┬───────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌───────────┐     ┌──────────────┐
│ Shows:    │     │ Shows:       │
│ ⚠️ Using  │     │ ✅ Found     │
│ fallback  │     │ staff via    │
│ user      │     │ username     │
└─────┬─────┘     └──────┬───────┘
      │                  │
      ▼                  ▼
 ❌ NOT FIXED       ✅ FIXED!
 (Need refresh)    (Working!)
```

---

## Issue 1: Messages Show Wrong Sender

### Symptom
```
Message sent by you → Shows "From: Chrysanthi"
```

### Diagnostic Steps

#### Step 1: Check Console
```
Press F12 → Console tab
```

#### Step 2: Look for These Messages

**🔴 BAD (Not Fixed):**
```
⚠️ Logged-in user not found in staff members.
   Username: johny
⚠️ Using fallback user: Chrysanthi
```

**🟢 GOOD (Fixed):**
```
✅ Found staff via username-to-name match: Johny
✅ Current user set: Johny (Staff ID: xxx-xxx-xxx)
```

### Solutions

#### Solution A: Hard Refresh (Most Common)
```
Press: Ctrl + Shift + R
(or Cmd + Shift + R on Mac)
```

Why: Browser cache showing old code.

#### Solution B: Clear Browser Cache
```
1. Press Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload page
```

#### Solution C: Check Session Storage
```javascript
// In console, run:
const session = sessionStorage.getItem('itrusty_user');
console.log('Session user:', JSON.parse(session));

// Should show:
// { username: "johny", email: "johny@..." }
```

If session is empty:
1. Go back to login page
2. Log in again
3. Return to messaging

---

## Issue 2: "File Attachment Coming Soon" Alert

### Symptom
```
Alert popup: "Ο ιστότοπος www.genspark.af λέει: 
             File attachment feature coming soon!"
```

### Diagnosis
✅ **This is NORMAL - Not a bug!**

### Explanation
- This alert comes from **GenSpark platform** (hosting)
- NOT from your messaging.html code
- Cannot be removed or modified
- Does not affect functionality

### What to Do
- ✅ Click "OK" to dismiss
- ✅ Continue using messaging
- ✅ Ignore future occurrences

**Note:** This is a platform-level notification about GenSpark's own features, not yours.

---

## Issue 3: Duplicate "EN EN" Buttons

### Symptom
```
Top right shows: [中文] [EN] [EN] [New Message]
```

### Diagnosis
✅ **This is from GenSpark Preview UI - Not your code!**

### Explanation

**In your code (`messaging.html`):**
```html
<!-- Only 1 language button -->
<button id="langToggle" onclick="window.i18n.toggleLanguage()">
    中文
</button>
```

**Extra "EN" buttons from:**
- GenSpark's preview/sandbox interface
- Browser DevTools UI
- Platform navigation

### What to Do
**If in GenSpark Preview:**
- Ignore extra buttons
- They're part of the platform UI
- Your code only has 1 button

**To verify:**
1. Open `messaging.html` directly (not in preview)
2. Count buttons in top-right
3. Should see: [Palette] [中文] [🔔] [New Message]

---

## Issue 4: Can't Send Messages

### Symptom
```
Click "Send Message" → Nothing happens
```

### Diagnostic Steps

#### Step 1: Check Console Errors
```
F12 → Console tab
Look for RED error messages
```

**Common Errors:**

**Error A: "Failed to fetch"**
```
Solution: Check internet connection
```

**Error B: "Cannot read property 'id' of undefined"**
```
Solution: Recipient not selected
Action: Select at least one recipient
```

**Error C: "Unauthorized"**
```
Solution: Session expired
Action: Log in again
```

#### Step 2: Check Network Tab
```
F12 → Network tab
Send message
Look for POST request to 'tables/messages'
```

**Status 201:** ✅ Message sent successfully  
**Status 400:** ❌ Bad request (check data)  
**Status 401:** ❌ Unauthorized (log in again)  
**Status 500:** ❌ Server error (contact support)

---

## Issue 5: Messages Not Appearing

### Symptom
```
Send message → Success notification
But message doesn't show in list
```

### Solutions

#### Solution A: Refresh Message List
```
Click the refresh icon (🔄) in navigation
```

#### Solution B: Reload Page
```
Press F5 or Ctrl + R
```

#### Solution C: Check Thread
```
1. Click on conversation with recipient
2. Scroll to bottom
3. Message should be there
```

---

## Issue 6: Can't See Staff Directory

### Symptom
```
Click "Staff Directory" → Modal doesn't open
```

### Solutions

#### Solution A: Check Console
```javascript
// In console, run:
fetch('tables/staff_members')
  .then(r => r.json())
  .then(d => console.log('Staff:', d.data));

// Should show list of staff members
```

#### Solution B: Reload Data
```
1. Click refresh icon (🔄)
2. Wait 2 seconds
3. Try "Staff Directory" again
```

---

## Issue 7: Notifications Not Working

### Symptom
```
Notification badge shows (0)
Even though you have unread messages
```

### Solutions

#### Solution A: Refresh Notifications
```
Click the bell icon (🔔) twice:
1. First click → Opens dropdown
2. Second click → Closes it
3. Badge should update
```

#### Solution B: Check Data
```javascript
// In console:
fetch('tables/notifications')
  .then(r => r.json())
  .then(d => console.log('Notifications:', d.data));

// Check if notifications exist
```

---

## Issue 8: Language Toggle Not Working

### Symptom
```
Click "中文" button → Nothing happens
```

### Solutions

#### Solution A: Check i18n System
```javascript
// In console:
console.log('i18n loaded:', typeof window.i18n);

// Should show: "object"
// If shows: "undefined" → i18n not loaded
```

#### Solution B: Reload i18n
```
1. Hard refresh: Ctrl + Shift + R
2. Check console for i18n errors
3. Try language toggle again
```

---

## Quick Reference: Console Commands

### Check Current User
```javascript
const session = sessionStorage.getItem('itrusty_user');
console.log('User:', JSON.parse(session));
```

### Check Staff Members
```javascript
fetch('tables/staff_members')
  .then(r => r.json())
  .then(d => console.table(d.data));
```

### Check Messages
```javascript
fetch('tables/messages')
  .then(r => r.json())
  .then(d => console.log('Messages:', d.data.length));
```

### Force Reload Data
```javascript
window.messagingSystem.loadData()
  .then(() => console.log('Data reloaded'));
```

### Check Messaging System
```javascript
console.log('Messaging System:', {
  currentUser: window.messagingSystem.currentUser,
  messages: window.messagingSystem.messages.length,
  staff: window.messagingSystem.staff.length
});
```

---

## Emergency Reset Procedure

**If everything is broken:**

### Step 1: Clear Everything
```javascript
// In console:
sessionStorage.clear();
localStorage.clear();
console.log('✅ Storage cleared');
```

### Step 2: Hard Refresh
```
Ctrl + Shift + R
```

### Step 3: Log In Again
```
1. Go to login page
2. Enter credentials
3. Return to messaging
```

### Step 4: Verify
```javascript
// Check session:
console.log('Session:', sessionStorage.getItem('itrusty_user'));

// Check messaging:
console.log('System:', window.messagingSystem);
```

---

## Getting Help

### Before Reporting Issue:

1. ✅ Did hard refresh (Ctrl+Shift+R)?
2. ✅ Checked console for errors?
3. ✅ Checked network tab for API calls?
4. ✅ Tried emergency reset?

### When Reporting:

**Include:**
- Browser (Chrome, Firefox, Safari)
- Console error messages (screenshot)
- Steps to reproduce
- Expected vs actual behavior

**Example Report:**
```
Browser: Chrome 120
Issue: Messages show wrong sender
Console: "Using fallback user: Chrysanthi"
Steps: 1. Open messaging 2. Send message 3. Shows wrong name
Expected: Should show "Johny"
Actual: Shows "Chrysanthi"
```

---

## Success Indicators

### ✅ Everything Working:

**Console (No errors):**
```
✅ Found staff via username-to-name match: Johny
✅ Current user set: Johny
MessagingSystem initialized
```

**UI:**
- Messages load
- Can send messages
- Notifications work
- Staff directory opens
- Language toggle works

**Network:**
- API calls successful (200/201 status)
- No 401/403 errors
- Data loads quickly

---

## Status Check Script

**Run this in console to verify everything:**

```javascript
async function checkMessagingStatus() {
    console.log('🔍 Messaging System Status Check\n');
    
    // Check session
    const session = sessionStorage.getItem('itrusty_user');
    console.log('1. Session:', session ? '✅' : '❌');
    
    // Check messaging system
    console.log('2. Messaging System:', 
        window.messagingSystem ? '✅' : '❌');
    
    // Check current user
    if (window.messagingSystem) {
        console.log('3. Current User:', 
            window.messagingSystem.currentUser ? '✅' : '❌');
        console.log('   User ID:', 
            window.messagingSystem.currentUser);
    }
    
    // Check staff
    try {
        const staff = await fetch('tables/staff_members');
        const staffData = await staff.json();
        console.log('4. Staff Members:', 
            staffData.data.length, '✅');
    } catch (e) {
        console.log('4. Staff Members: ❌', e.message);
    }
    
    // Check messages
    try {
        const msgs = await fetch('tables/messages');
        const msgsData = await msgs.json();
        console.log('5. Messages:', 
            msgsData.data.length, '✅');
    } catch (e) {
        console.log('5. Messages: ❌', e.message);
    }
    
    console.log('\n✅ Status check complete!');
}

checkMessagingStatus();
```

**Expected Output:**
```
🔍 Messaging System Status Check

1. Session: ✅
2. Messaging System: ✅
3. Current User: ✅
   User ID: xxx-xxx-xxx
4. Staff Members: 10 ✅
5. Messages: 45 ✅

✅ Status check complete!
```

---

**Last Updated:** May 16, 2025  
**Version:** 4.5.2  
**For:** messaging.html troubleshooting
