# 🔧 Message Sending Troubleshooting Guide

## ❌ "Failed to send message" Error - Quick Fixes

---

## 🎯 **Most Common Issue: No Recipients Selected**

### **Problem:**
You see "Failed to send message" because **no recipients were selected**.

### **Solution:**
1. Open the "New Message" form
2. Look for the **"Recipients"** section at the top
3. **Check the boxes** next to staff names:
   ```
   YIWU OFFICE
   ☑️ Peng (Manager)      ← Check this!
   ☐ Big Brother (QC)     ← Or this!
   ☐ Lin Yi (Warehouse)   ← Or this!
   
   SHENZHEN OFFICE
   ☑️ Lily (Manager)      ← Check at least one!
   ☐ Ruby (Sourcing)
   ```

4. You should see selected names appear as **blue chips** below:
   ```
   [Peng ×] [Lily ×]
   ```

5. Now fill in Subject and Message
6. Click "Send Message"
7. ✅ Should work!

---

## 📋 **Checklist Before Sending**

### **Required Fields:**
- [ ] ✅ At least one recipient **checked**
- [ ] ✅ Subject **filled in**
- [ ] ✅ Message body **filled in**

### **Optional Fields:**
- [ ] Message Type (defaults to "Internal")
- [ ] Priority (defaults to "Normal")
- [ ] Category
- [ ] Related Order
- [ ] Related Customer

---

## 🐛 **Debug Steps**

### **Step 1: Open Browser Console**
1. Press **F12** (or right-click → Inspect)
2. Click **"Console"** tab
3. Try sending message again
4. Look for error messages

### **Step 2: Check What Console Shows**

**✅ Good Signs:**
```
📤 Sending message: {from_staff_id: "...", to_staff_ids: [...]}
✅ Sending to 2 recipients: ["staff1", "staff2"]
📥 Response status: 201
✅ Message created: {id: "..."}
```

**❌ Bad Signs:**
```
❌ API Error: 400 Bad Request
❌ Error sending message: ...
```

### **Step 3: Common Errors & Fixes**

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "Please select at least one recipient" | No checkboxes checked | Check at least one staff member |
| "Please enter a subject" | Subject field empty | Fill in subject |
| "Please enter a message" | Message body empty | Fill in message text |
| "400 Bad Request" | Invalid data format | Check browser console for details |
| "404 Not Found" | API endpoint missing | Tables may not be created yet |
| "Network error" | No internet connection | Check internet connection |

---

## 🎓 **Step-by-Step Tutorial**

### **How to Send Your First Message:**

**Step 1: Open Messaging**
- Click "Messages" tab in main navigation

**Step 2: Click "New Message"**
- Big blue button in top right

**Step 3: Select Recipients**
```
In the "Recipients" box, you'll see a list like:

┌─────────────────────────────┐
│ YIWU OFFICE                 │
│ ☐ Peng (Manager)            │ ← Click checkbox
│ ☐ Big Brother (QC)          │
│ ☐ Lin Yi (Warehouse)        │
│                             │
│ SHENZHEN OFFICE             │
│ ☐ Lily (Manager)            │ ← Click checkbox
│ ☐ Ruby (Sourcing)           │
│ ☐ Xiao Min (Research)       │
└─────────────────────────────┘

Click the ☐ boxes to select staff
```

**Step 4: See Selected Chips**
```
After checking boxes, you'll see:

Selected: [Peng ×] [Lily ×]

These are "chips" showing who you selected
Click the × to remove someone
```

**Step 5: Fill in Form**
```
Message Type: [Internal ▼]        ← Choose type
Priority: [Normal ▼]               ← Choose priority
Category: [General ▼]              ← Choose category

Subject: _____________________     ← Type subject

Message:
┌──────────────────────────┐
│ Type your message here   │     ← Type message
│                          │
│                          │
└──────────────────────────┘
```

**Step 6: Click "Send Message"**
- Blue button at bottom right
- Should see "Message sent successfully! ✅"
- Modal closes
- Message appears in inbox

---

## 🔍 **Detailed Error Diagnosis**

### **Error: "Failed to send message"**

**Possible Causes:**

1. **No Recipients (Most Common)**
   - Fix: Check at least one staff member
   - Look for: Red border around recipient box

2. **Empty Subject**
   - Fix: Type something in "Subject" field
   - Error shows: "Please enter a subject"

3. **Empty Message**
   - Fix: Type something in "Message" field
   - Error shows: "Please enter a message"

4. **Database Table Missing**
   - Fix: Check if `messages` table exists
   - Open browser console, type:
   ```javascript
   fetch('tables/messages').then(r => r.json()).then(console.log)
   ```
   - Should show: `{data: [], total: 0, ...}`

5. **Staff Table Empty**
   - Fix: Check if staff members exist
   - Console command:
   ```javascript
   fetch('tables/staff_members').then(r => r.json()).then(console.log)
   ```
   - Should show list of staff

---

## 🧪 **Test Messages**

### **Test 1: Send to Yourself**
```
1. Open "New Message"
2. Find yourself in the list (Johny CEO)
3. Check your checkbox
4. Subject: "Test message"
5. Message: "Testing the system"
6. Click "Send Message"
7. Should see success notification
8. Check inbox - message should appear
```

### **Test 2: Send to Multiple People**
```
1. Open "New Message"
2. Check Lily and Ruby
3. Subject: "Team test"
4. Message: "Testing multiple recipients"
5. Send
6. Both should appear in "to_staff_ids" in console
```

---

## 💡 **Pro Tips**

### **Tip 1: Use Browser Console**
Always have console open (F12) when testing:
- See exactly what's happening
- Catch errors early
- Debug faster

### **Tip 2: Check the Chips**
Before clicking Send, look at the blue chips:
- No chips = No recipients = Will fail
- See chips = Recipients selected = Will work

### **Tip 3: Start Simple**
First message should be simple:
- 1 recipient (yourself)
- Simple subject
- Simple message
- Internal type
- Normal priority

Once that works, try more complex messages.

---

## 🚨 **Emergency Reset**

If nothing works, try this:

### **Full Reset:**
```javascript
// Open browser console (F12)
// Paste this to reload everything:

location.reload(true);
```

### **Clear Cache:**
1. Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Hard refresh clears old code
3. Try sending message again

---

## 📞 **Still Not Working?**

### **Collect This Information:**

1. **What did you do?**
   - Exact steps you took

2. **What happened?**
   - Exact error message
   - Screenshot if possible

3. **Console errors?**
   - Open F12 → Console
   - Copy any red error messages

4. **Network errors?**
   - F12 → Network tab
   - Look for failed requests (red)
   - Click them, copy details

---

## ✅ **Success Indicators**

**You know it's working when:**
- ✅ Blue chips appear under "Recipients"
- ✅ "Message sent successfully! ✅" notification
- ✅ Modal closes automatically
- ✅ Message appears in inbox
- ✅ Console shows: "✅ Message created"

**You know it's NOT working when:**
- ❌ Red "Failed to send message" notification
- ❌ Modal stays open
- ❌ Console shows: "❌ API Error"
- ❌ Red border around recipient box

---

## 🎯 **Quick Reference Card**

```
BEFORE YOU CLICK SEND:

✅ At least 1 recipient checked
✅ Blue chips visible below recipients
✅ Subject filled in
✅ Message filled in

AFTER YOU CLICK SEND:

✅ See green notification
✅ Modal closes
✅ Message in inbox
✅ Console shows success

IF IT FAILS:

1. Check browser console (F12)
2. Verify recipients selected
3. Verify subject & message filled
4. Try again
5. Check this guide for specific error
```

---

## 🎓 **Understanding the System**

### **What Happens When You Send:**

1. **You click "Send Message"**
2. System checks: Recipients selected? ✓
3. System checks: Subject filled? ✓
4. System checks: Message filled? ✓
5. System sends to API: `POST tables/messages`
6. API creates message in database
7. System creates notifications for recipients
8. System shows success message
9. System refreshes inbox
10. Done! ✅

### **Where Can It Fail?**

- ❌ Step 2: No recipients
- ❌ Step 3: No subject
- ❌ Step 4: No message
- ❌ Step 5: API error (network, permissions)
- ❌ Step 6: Database error

Each step has a specific error message to help you!

---

## 📊 **Common Scenarios**

### **Scenario 1: Testing Alone**
```
✅ Select yourself
✅ Send test message
✅ Check inbox
✅ See your message
```

### **Scenario 2: Message One Person**
```
✅ Select one staff member
✅ Clear subject and message
✅ Send
✅ They see it in their notifications
```

### **Scenario 3: Broadcast to All**
```
✅ Click "Broadcast Message" button
✅ All staff auto-selected
✅ Type announcement
✅ Send to everyone at once
```

---

**🎉 Most issues are fixed by simply checking at least one recipient!**

**Still stuck? Check the browser console (F12) - it will tell you exactly what's wrong!**
