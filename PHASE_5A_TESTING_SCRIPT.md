# 🧪 Phase 5A - Complete Testing Script

**Tester**: Ιωάννης Βλαχόπουλος  
**Version**: 3.1.0 (Phase 5A)  
**Estimated Time**: 15-20 minutes  
**Status**: Ready for execution

---

## 📋 Pre-Testing Setup

### Step 0: Open Invoice Creator
1. Navigate to your I Trusty platform
2. Click **Financial** → **Invoices** (or **Invoice Creator**)
3. Wait for page to load completely
4. You should see: "Quotation" type selected by default

---

## ✅ TEST 1: Customer Auto-Population (HIGH PRIORITY)

**Goal**: Verify ALL customer fields load when selecting from dropdown

### Steps:
1. **Locate** the customer dropdown (under "GST" section on right)
2. **Click** the dropdown (shows "-- Select Customer --")
3. **Select**: "GLS - Global SAT S.A."

### Expected Results:
- ✅ Dropdown turns **GREEN** for 2 seconds (visual feedback)
- ✅ Customer Code field fills with: **GLS**
- ✅ Address field shows: **P.O.BOX:74001-40, T.K. FLORINA, ATHENS, Postal Code: 15351, GREECE**
- ✅ Details section shows: **Global SAT S.A. | Tel: +30 2146460000 | Email: marianna@globalsat.gr | VAT: EL123456789**
- ✅ Invoice number updates to include customer code (e.g., QUO-20250515-GLS-001)

### Pass Criteria:
- [ ] All fields populated (no missing data)
- [ ] Phone number visible
- [ ] Postal code visible
- [ ] VAT number visible
- [ ] Green highlight appeared

### If Failed:
- Check browser console (F12) for errors
- Verify customer "GLS - Global SAT S.A." exists in dropdown
- Take screenshot and note what's missing

---

## ✅ TEST 2: Product Grid Structure (VISUAL CHECK)

**Goal**: Verify columns are in correct order and MIN URL is gone

### Steps:
1. **Scroll down** to the product grid (table with column headers)
2. **Count the columns** from left to right
3. **Read the header names** carefully

### Expected Results:
Column order (left to right):
1. ✅ ITEM NUMBER
2. ✅ PICTURE
3. ✅ NAME
4. ✅ DESCRIPTION
5. ✅ CTN
6. ✅ QTY PER CTN
7. ✅ TOTAL QTY
8. ✅ UNIT PRICE €
9. ✅ TOTAL PRICE €
10. ✅ PRODUCT URL
11. ✅ IMAGE URL (should say "no-print" or be styled differently)
12. ✅ NOTES
13. ✅ Price CNY (should say "no-print")
14. ✅ FX Rate (should say "no-print")
15. ✅ MARKUP % (should say "no-print")
16. ✅ Actions (should say "no-print")

### Pass Criteria:
- [ ] Total columns = 16 (not 17)
- [ ] NO "MIN URL" column exists
- [ ] Only ONE "Markup %" column (on right side)
- [ ] "Image URL" is AFTER "Product URL"
- [ ] "Picture" is 2nd column (after Item Number)

### If Failed:
- Take screenshot of column headers
- Note which columns are in wrong position

---

## ✅ TEST 3: Item Number Editability

**Goal**: Verify Item Number can be manually edited

### Steps:
1. **Click** "Add Product Row" button (purple button below grid)
2. A new row appears with Item Number = "1"
3. **Click** on the "1" in the Item Number cell
4. **Type**: "A1" (or any custom value)
5. Press Tab or click elsewhere

### Expected Results:
- ✅ Cell accepts your input
- ✅ Item Number changes from "1" to "A1"
- ✅ No error messages

### Pass Criteria:
- [ ] Item Number is editable
- [ ] Custom value is retained (doesn't reset to "1")

### If Failed:
- Note if cell is read-only (cursor doesn't appear)
- Check if value resets after typing

---

## ✅ TEST 4: Image Display Feature

**Goal**: Verify image displays in Picture column when URL entered

### Steps:
1. In the same product row, **scroll right** to find "IMAGE URL" column (should be column 11)
2. **Click** in the IMAGE URL input field
3. **Paste** this test image URL:
   ```
   https://i.postimg.cc/Njf0T28p/I-Trusty-clear-logo-1.png
   ```
4. Press Tab or click elsewhere

### Expected Results:
- ✅ Image appears **immediately** in the PICTURE column (column 2)
- ✅ Image is small thumbnail (approximately 16×16 pixels)
- ✅ "No image" text disappears

### Additional Test:
5. **Clear** the IMAGE URL field (delete the URL)
6. Press Tab

### Expected Results:
- ✅ Image disappears
- ✅ "No image" placeholder text returns

### Pass Criteria:
- [ ] Image displays when URL entered
- [ ] Image disappears when URL cleared
- [ ] No broken image icon

### If Failed:
- Check if Picture column shows URL text instead of image
- Check if Image URL is in wrong column
- Take screenshot

---

## ✅ TEST 5: Unit Price Formula (CRITICAL)

**Goal**: Verify automatic calculation: Unit Price = (CNY × (1 + Markup%)) / FX Rate

### Steps:
1. In the product row, **enter these values**:
   - **Price CNY** (column 13): 100
   - **FX Rate** (column 14): 8
   - **MARKUP %** (column 15): 25

2. Press Tab after each entry

### Expected Results:
- ✅ **Unit Price €** (column 8) automatically calculates to: **15.63** (or 15.625)

### Manual Calculation Verification:
```
CNY = 100
Markup % = 25
FX Rate = 8

Step 1: 100 × (1 + 25/100) = 100 × 1.25 = 125
Step 2: 125 / 8 = 15.625
Rounded: 15.63
```

### Pass Criteria:
- [ ] Unit Price shows 15.63 (or 15.625)
- [ ] Calculation happens automatically (no need to click anything)
- [ ] Unit Price updates when you change CNY, Markup, or FX Rate

### If Failed:
- Note what value appears in Unit Price
- Check if it's still "0.00"
- Check browser console for JavaScript errors

---

## ✅ TEST 6: Manual Unit Price Override

**Goal**: Verify you can manually edit Unit Price (for discounts)

### Steps:
1. With the same product row, **click** on the Unit Price cell (should show 15.63)
2. **Type**: 12.00 (giving a discount)
3. Press Tab
4. Now **change** the Markup % from 25 to 30
5. Press Tab

### Expected Results:
- ✅ Unit Price accepts your manual entry (12.00)
- ✅ When you change Markup % to 30, Unit Price **STAYS at 12.00** (doesn't recalculate)
- ✅ System "remembers" your manual override

### Pass Criteria:
- [ ] Manual edit accepted
- [ ] Manual edit preserved when other fields change
- [ ] No automatic recalculation after manual edit

### If Failed:
- Note if Unit Price keeps recalculating
- Note if you can't edit the field at all

---

## ✅ TEST 7: Total Quantity Auto-Calculation

**Goal**: Verify Total QTY = CTN × QTY per CTN

### Steps:
1. In the same product row, **enter**:
   - **CTN** (column 5): 5
   - **QTY PER CTN** (column 6): 100
2. Press Tab after each

### Expected Results:
- ✅ **TOTAL QTY** (column 7) automatically shows: **500**

### Pass Criteria:
- [ ] Total QTY calculates correctly (5 × 100 = 500)

---

## ✅ TEST 8: Manual Total Quantity Override

**Goal**: Verify you can manually override Total QTY

### Steps:
1. **Click** on the Total QTY cell (shows 500)
2. **Type**: 450 (manual override)
3. Press Tab
4. Now **change** CTN from 5 to 6
5. Press Tab

### Expected Results:
- ✅ Total QTY accepts your manual entry (450)
- ✅ When you change CTN to 6, Total QTY **STAYS at 450** (doesn't recalculate to 600)
- ✅ System "remembers" your manual override

### Pass Criteria:
- [ ] Manual edit accepted
- [ ] Manual edit preserved when CTN or QTY per CTN changes

### If Failed:
- Note if Total QTY recalculates to 600

---

## ✅ TEST 9: Total Price Calculation

**Goal**: Verify Total Price = Total QTY × Unit Price

### Steps:
1. Look at the **TOTAL PRICE €** (column 9)
2. It should auto-calculate from:
   - Total QTY: 450
   - Unit Price: 12.00

### Expected Result:
- ✅ Total Price = **5400.00** (450 × 12.00)

### Pass Criteria:
- [ ] Total Price is correct (5400.00)

---

## ✅ TEST 10: Manual Total Price Override

**Goal**: Verify you can manually override Total Price (for special deals)

### Steps:
1. **Click** on the Total Price cell (shows 5400.00)
2. **Type**: 5000.00 (special discount)
3. Press Tab
4. Now **change** Total QTY from 450 to 500
5. Press Tab

### Expected Results:
- ✅ Total Price accepts your manual entry (5000.00)
- ✅ When you change Total QTY, Total Price **STAYS at 5000.00** (doesn't recalculate)

### Pass Criteria:
- [ ] Manual edit accepted
- [ ] Manual edit preserved

---

## ✅ TEST 11: Subtotal and Grand Total

**Goal**: Verify footer totals update

### Steps:
1. **Scroll down** to the footer section (below product grid)
2. Look at the **Total:** row (should say "Total: €5000.00")
3. Look at the **Grand Total (EU):** row

### Expected Results:
- ✅ Subtotal Products = 5000.00 (sum of all product rows)
- ✅ Grand Total updates in real-time

### Pass Criteria:
- [ ] Footer totals are correct

---

## ✅ TEST 12: Save Invoice

**Goal**: Verify all data is saved correctly

### Steps:
1. **Scroll up** to top of page
2. **Click** "Save Invoice" button (green button)
3. Wait for response

### Expected Results:
- ✅ Success message appears (e.g., "Invoice saved successfully!")
- ✅ No error messages
- ✅ Browser console shows "✅ Invoice saved"

### Pass Criteria:
- [ ] Save successful
- [ ] No errors in console

### If Failed:
- Check browser console for error details
- Note exact error message
- Take screenshot

---

## ✅ TEST 13: Print Preview (Optional)

**Goal**: Verify no-print columns are hidden

### Steps:
1. Press **Ctrl+P** (or Cmd+P on Mac)
2. Print preview window opens
3. **Look at the product grid** in preview

### Expected Results:
- ✅ These columns are HIDDEN (not visible):
  - IMAGE URL
  - Price CNY
  - FX Rate
  - MARKUP %
  - Actions
- ✅ These columns are VISIBLE:
  - Item Number
  - Picture (with image)
  - Name
  - Description
  - CTN
  - QTY per CTN
  - Total QTY
  - Unit Price
  - Total Price
  - Product URL
  - Notes

### Pass Criteria:
- [ ] Internal columns hidden when printing
- [ ] Layout looks professional

---

## 📊 Test Results Summary

**Date**: __________  
**Tester**: __________

| Test # | Test Name | Pass? | Notes |
|--------|-----------|-------|-------|
| 1 | Customer Auto-Population | ☐ Pass ☐ Fail | |
| 2 | Grid Structure | ☐ Pass ☐ Fail | |
| 3 | Item Number Edit | ☐ Pass ☐ Fail | |
| 4 | Image Display | ☐ Pass ☐ Fail | |
| 5 | Unit Price Formula | ☐ Pass ☐ Fail | |
| 6 | Manual Price Override | ☐ Pass ☐ Fail | |
| 7 | Total QTY Calc | ☐ Pass ☐ Fail | |
| 8 | Manual QTY Override | ☐ Pass ☐ Fail | |
| 9 | Total Price Calc | ☐ Pass ☐ Fail | |
| 10 | Manual Total Override | ☐ Pass ☐ Fail | |
| 11 | Footer Totals | ☐ Pass ☐ Fail | |
| 12 | Save Invoice | ☐ Pass ☐ Fail | |
| 13 | Print Preview | ☐ Pass ☐ Fail | |

**Overall Phase 5A Status**: ☐ APPROVED ☐ NEEDS FIXES

---

## 🐛 Issues Found

(Document any problems discovered during testing)

### Issue 1:
- **Test #**: ___
- **Description**: ___________________________
- **Severity**: ☐ Critical ☐ High ☐ Medium ☐ Low
- **Screenshot**: ___________________________

### Issue 2:
- **Test #**: ___
- **Description**: ___________________________
- **Severity**: ☐ Critical ☐ High ☐ Medium ☐ Low
- **Screenshot**: ___________________________

---

## ✅ Sign-Off

**I confirm that**:
- [ ] All critical tests passed
- [ ] Phase 5A features work as expected
- [ ] Ready to proceed to Phase 5B (UI/UX polish)

**Signature**: ___________________  
**Date**: ___________________

---

**Next Phase**: Phase 5B - Theme colors, conditional banks, print optimization

*"Test thoroughly, deploy confidently."*
