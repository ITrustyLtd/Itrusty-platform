# Real-Time Activity Feed System

## Overview

The Activity Feed is a **real-time monitoring system** that displays every action taken across all orders, workflow steps, and team activities. It appears as a **fixed right sidebar** on the orders-enhanced.html page.

---

## Features

### ✅ What Gets Logged

Every significant action creates an activity entry with a timestamp:

#### **Order Actions**
- ✨ Order created
- 🔄 Order status changed
- 📝 Order details updated

#### **Workflow Steps**
- ▶️ Step started
- ✅ Step completed
- 🔄 Step status changed
- ⏸️ Step put on hold

#### **Sourcing Activities**
- 🔍 Sourcing started
- ✅ Sourcing completed
- 📋 Quotation delivered

#### **Quality Control**
- 🔬 QC inspection started
- ✅ QC passed
- ❌ QC failed
- 🔄 QC re-inspection

#### **Payments**
- 💰 Deposit received
- 💳 Supplier payment sent
- 💵 Final payment received
- 💸 Payment processed

#### **Logistics**
- 📦 Warehouse arrival
- 📦 Packing completed
- 📄 Export documents ready
- 🚢 FOB confirmed
- 📋 Telex released
- 🚚 Shipment dispatched

---

## Activity Feed Format

Each activity displays:

```
┌──────────────────────────────────────┐
│ 🔵 [ICON]                            │
│ GST-251013                           │
│ Ruby: Finished sourcing              │
│ → Sourcing                           │
│ 🕐 2m ago                            │
└──────────────────────────────────────┘
```

### Components

1. **Colored Icon** - Visual indicator of activity type
   - 🔵 Blue: Orders, shipments
   - 🟢 Green: Completions, payments received
   - 🟡 Yellow: Status changes
   - 🟣 Purple: Sourcing
   - 🔴 Pink: QC activities

2. **Order Number** - Quick identification (GST-251013, SRP-2510803, etc.)

3. **Staff Name + Action** - Who did what
   - "Ruby: Finished sourcing"
   - "Lily: Shipped out order"
   - "Zheng: QC inspection passed"

4. **Step Name** - Which workflow step (if applicable)
   - "→ Sourcing"
   - "→ QC Inspection"

5. **Payment Amount** (if applicable)
   - "USD 10,800"
   - "RMB 45,000"

6. **Time Watermark** - How long ago
   - "2s ago" - just happened
   - "5m ago" - 5 minutes ago
   - "2h ago" - 2 hours ago
   - "1d ago" - 1 day ago
   - Full timestamp for older entries

---

## How It Works

### Automatic Activity Logging

Activities are **automatically logged** when:

1. **Creating an Order**
   ```javascript
   // System automatically logs when order is created
   await this.createOrderWithWorkflow(orderData, orderType);
   // → Creates activity: "Created new order with 17 workflow steps"
   ```

2. **Updating Workflow Steps**
   ```javascript
   // When staff member updates a step
   await ordersEnhanced.updateWorkflowStep(
       stepId, 
       { status: 'Completed' },
       staffId,
       staffName
   );
   // → Creates activity: "Ruby: Finished Sourcing"
   ```

3. **Logging Payments**
   ```javascript
   // When payment is received
   await ordersEnhanced.logPaymentActivity(
       order,
       'deposit',
       10800,
       'USD',
       staffId,
       staffName
   );
   // → Creates activity: "James: Received deposit payment - USD 10,800"
   ```

### Live Updates

The feed refreshes **every 30 seconds** automatically:
- New activities appear at the top
- Activities less than 5 seconds old are highlighted in blue
- Smooth animations for new entries

---

## Testing the Activity Feed

### Test 1: View Existing Activities

1. Open `orders-enhanced.html`
2. Look at the right sidebar
3. You should see 10 sample activities including:
   - GST-251013: Ruby finished sourcing
   - SRP-2510803: Lily shipped out
   - AMD-2025-089: Zheng completed QC
   - CTC-2024-002: James received deposit

### Test 2: Create New Order (Generates Activity)

1. Click "**+ New Order**" button
2. Fill in form:
   - Order Number: TEST-001
   - Client: Test Customer
   - Type: Standard
   - Description: Test products
3. Click "**Create Order & Start Workflow**"
4. **Watch the activity feed** - new entry appears:
   - "System: Created new order with 17 workflow steps"

### Test 3: Manual Activity Logging (Console Testing)

Open browser console (F12) and run:

```javascript
// Test workflow step update
testWorkflowUpdate('some-step-id', 'Completed', 'Ruby');

// Test payment logging
testPaymentLog('GST-251013', 'deposit', 15000, 'USD', 'James');
```

### Test 4: Live Updates

1. Open `orders-enhanced.html` in **two browser windows**
2. In Window 1: Create a new order
3. In Window 2: Wait 30 seconds
4. The new activity appears automatically in Window 2

---

## Activity Types Reference

| Activity Type | Icon | Description | Example |
|--------------|------|-------------|---------|
| `order_created` | ➕ | New order added | "System: Created new order" |
| `step_started` | ▶️ | Workflow step begins | "Ruby: Started Sourcing" |
| `step_completed` | ✅ | Generic step done | "Completed Request" |
| `sourcing_completed` | 🔍 | Sourcing finished | "Ruby: Finished sourcing" |
| `qc_passed` | ✅✅ | QC inspection OK | "Zheng: QC passed" |
| `qc_failed` | ❌ | QC found issues | "Zheng: QC failed" |
| `payment_received` | 💰 | Money received | "Received payment" |
| `deposit_received` | 💵 | Deposit paid | "James: Received deposit - USD 10,800" |
| `payment_sent` | 💳 | Paid supplier | "James: Paid supplier - RMB 45,000" |
| `final_payment_received` | 💰 | Balance paid | "Received final payment" |
| `quotation_sent` | 📋 | Quote delivered | "Nikos: Sent quotation" |
| `production_started` | 🏭 | Factory begins | "Production started" |
| `warehouse_arrival` | 📦 | Goods received | "Lin Yi: Arrived at warehouse" |
| `packing_completed` | 📦 | Packing done | "Lin Yi: Finished packing" |
| `export_ready` | 📄 | Docs complete | "Export documents ready" |
| `fob_confirmed` | 🚢 | FOB done | "FOB confirmed" |
| `shipment_dispatched` | 🚚 | Goods shipped | "Lily: Shipped out" |
| `telex_released` | 📋 | Telex done | "Telex released" |
| `status_changed` | 🔄 | Generic change | "Updated status" |

---

## Database Schema

### `activity_feed` Table

```javascript
{
    id: "uuid",                           // Auto-generated
    timestamp: "2025-05-15T09:15:00Z",   // ISO datetime
    activity_type: "sourcing_completed",  // See types above
    order_id: "order-uuid",               // Related order
    order_number: "GST-251013",          // Human-readable
    staff_id: "staff-uuid",               // Who did it
    staff_name: "Ruby",                   // Display name
    step_name: "Sourcing",                // Workflow step
    action_description: "Finished sourcing, delivered quotation",
    action_description_zh: "完成采购，交付报价",
    old_status: "In Progress",            // Before
    new_status: "Completed",              // After
    amount: 10800,                        // Payment amount
    currency: "USD",                      // Currency code
    metadata: "{...}"                     // Extra JSON data
}
```

---

## Bilingual Support

All activities display in **English by default**, with Chinese translations stored:

```javascript
action_description: "Finished sourcing, delivered quotation"
action_description_zh: "完成采购，交付报价"
```

Toggle language in the UI to see Chinese versions.

---

## Integration with Other Systems

### Automatic Triggers

The activity feed integrates with:

1. **Order Creation** - Logs when `createOrderWithWorkflow()` is called
2. **Workflow Updates** - Logs when `updateWorkflowStep()` is called
3. **Payment Processing** - Logs when `logPaymentActivity()` is called
4. **Notifications** - Notifications and activities are created together

### Manual Logging

You can log custom activities:

```javascript
await ordersEnhanced.logActivity({
    activity_type: 'custom_action',
    order_id: order.id,
    order_number: order.order_number,
    staff_id: 'staff-123',
    staff_name: 'Ruby',
    step_name: 'Custom Step',
    action_description: 'Performed custom action',
    action_description_zh: '执行自定义操作',
    metadata: JSON.stringify({ custom_data: 'value' })
});
```

---

## Performance

- **Limit**: Displays latest 100 activities
- **Refresh Rate**: Every 30 seconds
- **Animation**: New items (< 5s old) are highlighted
- **Sorting**: Newest first (descending timestamp)

---

## Troubleshooting

### Activity Feed Not Showing

1. Check browser console for errors
2. Verify `activity_feed` table exists
3. Ensure `orders-enhanced.js` is loaded
4. Check network tab for API calls to `tables/activity_feed`

### Activities Not Logging

1. Verify `logActivity()` function is being called
2. Check that order/staff data is available
3. Look for errors in console during CRUD operations

### Old Activities Not Clearing

The feed keeps the latest 100 entries. To clear old data:

```javascript
// Clear all activities (development only)
await fetch('tables/activity_feed', { method: 'DELETE' });
```

---

## Future Enhancements

Planned features:

- 📱 **Push Notifications** - Browser notifications for critical activities
- 🔍 **Activity Search** - Filter by staff, order, type, date
- 📊 **Activity Analytics** - Charts showing team productivity
- 📥 **Export** - Download activity log as CSV/PDF
- 🎨 **Customization** - User can choose which activity types to show
- 🔔 **Sound Alerts** - Audio notification for high-priority activities

---

## Summary

The Activity Feed provides:
- ✅ **Complete transparency** - Every action is logged
- ✅ **Real-time updates** - See what's happening now
- ✅ **Team coordination** - Know who's doing what
- ✅ **Audit trail** - Historical record of all activities
- ✅ **Time watermarks** - Exact timestamps for everything

**Result**: Full visibility into your I Trusty operations, helping you catch delays early and coordinate your global team effectively.
