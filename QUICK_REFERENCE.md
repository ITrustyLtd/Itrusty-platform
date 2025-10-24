# 🚀 I Trusty Ltd - Quick Reference Card

## 📍 Main Files

| File | Purpose | Access |
|------|---------|--------|
| **index-new.html** | ⭐ Main Dashboard | Your new homepage |
| **suppliers-list.html** | Supplier Management | From dashboard nav |
| **orders-enhanced.html** | Orders & Workflow | From dashboard nav |
| **js/dashboard-enhanced.js** | Dashboard Logic | Auto-loaded |

---

## 🎨 Theme Colors

| Theme | Primary Color | Use Case |
|-------|--------------|----------|
| **Elegant** 🔷 | #1F2A44 Navy | Professional meetings, client presentations |
| **Eco** 🌿 | #486349 Forest Green | Sustainability projects, natural products |
| **Santorini** 🌊 | #1A4599 Mediterranean Blue | Summer mood, fresh start |
| **Colorful** 🍂 | #B69030 Autumn Gold | Creative sessions, warm atmosphere |

---

## 🧭 Navigation Quick Access

| Icon | Label | Destination | Keyboard |
|------|-------|-------------|----------|
| 📦 | Orders & Workflow | orders-enhanced.html | Alt+1 |
| 🚚 | Suppliers | suppliers-list.html | Alt+2 |
| 📊 | Projects | projects.html | Alt+3 |
| 👥 | Team | team-management.html | Alt+4 |
| 📝 | Activities | daily-activities.html | Alt+5 |
| 🔄 | Workflow | workflow-manager.html | Alt+6 |

---

## 📊 Quick Stats Explained

| Stat | What It Shows | Good Range |
|------|---------------|------------|
| **Active Orders** | Orders not completed/cancelled | 5-20 |
| **Monthly Revenue** | Current month confirmed orders (USD) | $50K-200K |
| **Monthly Payroll** | Total team salaries (RMB) | ¥87,815 fixed |
| **Overdue Items** | Tasks past due date | 0-2 (3+ is red flag) |

---

## 📈 Dashboard Charts

### 1. Orders Pipeline (Bar Chart)
Shows order distribution across stages:
- 📧 **Enquiry** - Initial customer interest
- 💰 **Proforma** - Quote sent, awaiting confirmation
- ✅ **Confirmed** - Order confirmed, processing
- 🏭 **Production** - Manufacturing in progress
- 🚢 **Shipping** - In transit
- ✔️ **Completed** - Delivered and closed

**What to watch:** High Proforma count (stuck deals), Low Production (supply chain issues)

### 2. Team Utilization (Doughnut Chart)
Shows active task distribution per team member:
- **Balanced**: Everyone has 2-5 tasks
- **Overloaded**: Someone has 8+ tasks (red flag)
- **Underutilized**: Someone has 0-1 tasks (reassign work)

**Action:** If Ruby has 10+ tasks, delegate to Xiao Min

### 3. Recent Alerts (Notification Center)
Priority-sorted issues requiring attention:
- 🔴 **High**: Overdue tasks - Fix TODAY
- 🟡 **Medium**: Due soon, stuck deals - Fix this WEEK
- 🔵 **Low**: Reminders - Review when free

**Best practice:** Clear all high-priority alerts daily before 10 AM

### 4. Monthly Performance (Line Chart)
6-month revenue trend:
- **Upward trend**: Business growing ✅
- **Flat**: Stable but not expanding
- **Downward**: Need more orders ⚠️

**Target:** 10% month-over-month growth

---

## 🚚 Supplier Management Cheatsheet

### Quick Actions

| Task | Steps |
|------|-------|
| **Add Supplier** | Click "+Add Supplier" → Fill form → Save |
| **Find Supplier** | Type name in search box |
| **Rate Quality** | Edit supplier → Set 1-5 stars |
| **Track Spending** | View "Total Spent" on supplier card |
| **Check Reliability** | Look at star ratings and delivery days |
| **Filter by Category** | Use category dropdown |

### Key Fields Priority

**Must Have:**
1. Supplier Name
2. Contact Person
3. Phone Number
4. WeChat ID (for notifications)

**Should Have:**
5. Product Categories
6. Quality Rating (1-5)
7. Payment Terms
8. City/Province

**Nice to Have:**
9. Email
10. Credit Limit
11. Delivery Days
12. Notes

---

## 🔔 Alert Types & Actions

| Alert Type | Color | Who Gets Notified | Action Required |
|------------|-------|-------------------|-----------------|
| **Overdue Step** | 🔴 Red | Assigned person + Managers | Complete task TODAY |
| **Proforma Stuck >7d** | 🟡 Yellow | Sales team + Managers | Call customer |
| **Payment Due Soon** | 🟡 Yellow | James + Managers | Send payment reminder |
| **QC Pending >2d** | 🟡 Yellow | Zheng, Lin Yi, Peng | Complete inspection |

### WeChat Notification Recipients

| Alert | Peng | Lily | Ruby | Zheng | Lin Yi | James | Sales Team |
|-------|------|------|------|-------|--------|-------|------------|
| Overdue | ✅ | ✅ | If assigned | If assigned | If assigned | If assigned | - |
| Stuck Proforma | ✅ | ✅ | - | - | - | - | ✅ |
| Payment Due | ✅ | ✅ | - | - | - | ✅ | - |
| QC Pending | ✅ | - | - | ✅ | ✅ | - | - |

---

## 👥 Team Quick Reference

### Yiwu Office (¥30,000/month)
```
Peng          Manager           ¥12,000    peng_yiwu
Zheng         QC Worker         ¥6,000     zheng_qc
Lin Yi        Warehouse QC      ¥7,000     linyi_qc
James         Banking           ¥5,000     james_finance
```

### Shenzhen Office (¥40,500/month)
```
Lily          Manager (Sales)   ¥18,500    lily_sz
Ruby          Sourcing          ¥8,500     ruby_sourcing
Xiao Min      Research          ¥6,500     xiaomin_research
Silent Artist Designer          ¥7,000     artist_design
Johny         CEO               -          johny_ceo
```

### Greece Office (¥17,325/month)
```
Nikos         Client Relations  ¥10,760    (€1,230)
Chrysanthi    Data Management   ¥6,565     (€750)
```

**Total: ¥87,815/month** (plus any commissions)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Alt + 1-6** | Navigate to main sections |
| **Ctrl + F** | Search suppliers |
| **Esc** | Close modal |
| **Ctrl + Shift + T** | Toggle theme (if implemented) |
| **Ctrl + Shift + L** | Toggle language (if implemented) |

---

## 🐛 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Dashboard shows 0s | Check if tables have data, wait 2min for refresh |
| Theme won't change | Clear localStorage, reload page |
| Language stuck | Click EN/中文 multiple times, check console |
| Charts blank | Verify Chart.js CDN loaded, try different theme |
| Supplier not saving | Check console for errors, verify required fields |
| WeChat not sending | Normal in dev mode, see implementation guide |

**Emergency Reset:**
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## 📱 Mobile Access

Current status: **Desktop-optimized**

For mobile use:
1. Rotate to landscape for best view
2. Use pinch-to-zoom on charts
3. Supplier cards stack vertically (works well)
4. Navigation buttons collapse to icons

*Mobile optimization planned for Month 1*

---

## 🔐 Security Notes

- No authentication system yet
- All team members can see all data
- No user-level permissions
- WeChat IDs visible to all users

**For production:** Implement login system and role-based access

---

## 📊 KPI Targets (2025)

| Metric | Target | Current |
|--------|--------|---------|
| Monthly Revenue | $150,000 | Check dashboard |
| Active Orders | 15 | Check dashboard |
| Overdue Rate | <5% | Check dashboard |
| Team Utilization | 80-90% | Check chart |
| Supplier Quality Avg | >4.0 stars | Check suppliers |
| Order Completion Time | <30 days | Manual calc |

---

## 🎯 Daily Manager Checklist

### Morning (8:30 AM)
- [ ] Check dashboard overdue count (should be 0)
- [ ] Review new alerts from overnight
- [ ] Check team utilization for the day
- [ ] Send any urgent WeChat notifications

### Midday (12:00 PM)
- [ ] Review orders pipeline for stuck items
- [ ] Check if any payments due today (yellow alerts)
- [ ] Verify QC inspections on schedule

### Evening (5:30 PM)
- [ ] Complete any overdue tasks or delegate
- [ ] Review monthly revenue progress
- [ ] Plan tomorrow's priority tasks
- [ ] Update supplier ratings if orders completed

---

## 🚀 Power User Tips

1. **Theme Matching**
   - Elegant: Use for board meetings and financial reviews
   - Eco: Use for Siluan project work
   - Santorini: Use for summer product launches
   - Colorful: Use for creative brainstorming

2. **Alert Management**
   - Set aside 30 minutes each morning for alerts
   - Send WeChat notifications in batches
   - Clear high-priority before medium-priority

3. **Supplier Strategy**
   - Rate suppliers immediately after order completion
   - Update payment terms if they change
   - Add notes about personal relationships
   - Track WeChat IDs for faster communication

4. **Team Optimization**
   - Check utilization chart weekly
   - Rebalance workload on Mondays
   - Identify training needs from patterns
   - Celebrate high performers

5. **Revenue Tracking**
   - Check performance chart trend weekly
   - Compare month-over-month growth
   - Identify seasonal patterns
   - Set quarterly revenue goals

---

## 📞 Who to Contact

| Issue | Contact |
|-------|---------|
| System not working | Check console, review implementation guide |
| Need new feature | Document requirement, plan sprint |
| Data incorrect | Verify source tables, check calculations |
| WeChat integration | See implementation guide setup section |
| Theme customization | Edit index-new.html CSS section |
| Supplier issues | Use supplier management page |

---

## 🎓 Training Resources

1. **README.md** - Full system documentation
2. **IMPLEMENTATION_GUIDE.md** - Detailed setup and usage
3. **This File** - Quick reference
4. **Browser Console** - Real-time debugging info
5. **Inline Comments** - Check HTML/JS source code

---

## ✅ Daily Success Metrics

At end of each day, these should be TRUE:

- [ ] Overdue count = 0
- [ ] All high-priority alerts addressed
- [ ] Team utilization balanced (no one >8 tasks)
- [ ] New orders entered within 2 hours of receipt
- [ ] Supplier ratings updated for completed orders
- [ ] WeChat notifications sent for urgent items
- [ ] Dashboard reviewed at least 3 times during work hours

---

## 🔄 Update Schedule

| Item | Frequency |
|------|-----------|
| Dashboard auto-refresh | Every 2 minutes |
| Manual data check | 3x daily |
| Supplier rating update | After each order |
| Team workload review | Weekly Monday |
| Theme change | As needed |
| System backup | Weekly (implement) |

---

## 📈 Growth Indicators

**Your business is growing if:**
✅ Monthly performance chart trending up  
✅ Average order value increasing  
✅ More orders in Confirmed/Production stages  
✅ Supplier quality ratings improving  
✅ Fewer overdue alerts over time  
✅ Team utilization steady at 80-90%  

**Warning signs to watch:**
⚠️ Performance chart flat or declining  
⚠️ Many orders stuck in Proforma stage  
⚠️ Consistent overdue alerts (>5)  
⚠️ Team utilization below 60% or above 95%  
⚠️ Supplier quality ratings declining  
⚠️ Payment alerts increasing  

---

## 🎯 First Week Goals

**Day 1:** Set up dashboard, choose default theme, verify all data loading  
**Day 2:** Add top 10 suppliers with ratings  
**Day 3:** Link existing orders to suppliers  
**Day 4:** Train Peng and Lily on alert system  
**Day 5:** Establish daily review routine  
**Day 6-7:** Monitor and adjust workflows  

---

*Print this page and keep near your desk for quick reference!*

**Last Updated:** May 2025  
**System Version:** 3.0.0  
**For:** I Trusty Ltd Management Team
