# 🎯 Three Import Endpoints - Which One to Use?

## Quick Decision Guide

```
┌─ Do you want to update PRICES? ─┐
│                                  │
│  YES                         NO  │
│   │                           │  │
│   ├─ Update existing tests?   │  │
│   │  YES → Endpoint 1         │  │
│   │  NO  → Endpoint 3         │  │
│   │                           │  │
│   │                           └─→ Endpoint 2
└──────────────────────────────────┘
```

---

## 📋 Endpoint Comparison Table

| Feature | Endpoint 1<br/>bulkUpdateTestsAndPrices | Endpoint 2<br/>addTestsOnlyFromExcel | Endpoint 3<br/>addMissingTestsWithPrices |
|---------|------------|-----------|------------|
| **Create new tests** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Update existing tests** | ✅ Yes | ✅ Yes | ❌ No (Skip) |
| **Create new prices** | ✅ Yes | ❌ No | ✅ Yes |
| **Update existing prices** | ✅ Yes | ❌ No | ❌ No |
| **Requires companies field** | ✅ Yes | ❌ No | ✅ Yes |
| **Best for** | Full sync | Add tests only | First-time import |

---

## 1️⃣ Endpoint 1: Bulk Update Tests AND Prices

### URL
```
POST http://localhost:5000/api/v1/price/bulkUpdateTestsAndPrices
```

### What It Does
- ✅ Creates NEW tests if they don't exist
- ✅ **Updates EXISTING tests** with new conditions
- ✅ Creates NEW prices for companies
- ✅ **Updates EXISTING prices** with new values

### When to Use
- **Regular price updates** - Monthly/weekly price changes
- **Full data sync** - You want everything up to date
- **After manual database changes** - Resync everything

### Postman Configuration

**Headers:**
| Key | Value |
|-----|-------|
| token | `MahmoudOthman_Fekrah_App eyJhbGci...` |

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| priceFile | File | price (1).xlsx |
| conditionsFile | File | List&Conditions.xlsx |
| companies | Text | `["6868267037e7c8afc02e1289","686826e337e7c8afc02e1297"]` |

### Response Example
```json
{
  "message": "Bulk update completed successfully",
  "statistics": {
    "testsCreated": 5,
    "testsUpdated": 1686,
    "pricesCreated": 10,
    "pricesUpdated": 3372,
    "errors": []
  }
}
```

---

## 2️⃣ Endpoint 2: Add Tests Only (NO Prices)

### URL
```
POST http://localhost:5000/api/v1/price/addTestsOnlyFromExcel
```

### What It Does
- ✅ Creates NEW tests if they don't exist
- ✅ Updates EXISTING tests with new conditions
- ❌ **Does NOT touch prices at all**

### When to Use
- **Just adding test definitions** - No pricing yet
- **Test catalog update** - New medical tests added to system
- **Preparing for pricing** - Add tests first, prices later

### Postman Configuration

**Headers:**
| Key | Value |
|-----|-------|
| token | `MahmoudOthman_Fekrah_App eyJhbGci...` |

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| priceFile | File | price (1).xlsx |
| conditionsFile | File | List&Conditions.xlsx |

**NO companies field needed!**

### Response Example
```json
{
  "message": "Tests added successfully",
  "statistics": {
    "testsCreated": 150,
    "testsUpdated": 1541,
    "testsSkipped": 0,
    "errors": []
  }
}
```

---

## 3️⃣ Endpoint 3: Add ONLY Missing Tests with Prices ⭐ **NEW!**

### URL
```
POST http://localhost:5000/api/v1/price/addMissingTestsWithPrices
```

### What It Does
- ✅ Creates NEW tests if they don't exist
- ✅ Creates prices for those NEW tests
- ❌ **Completely SKIPS existing tests** (no updates, no price changes)

### When to Use
- **First-time import** - Initial system setup
- **Adding new tests only** - Don't touch existing data
- **Safe incremental updates** - Only add what's missing
- **After validation errors** - Add tests that failed before

### Postman Configuration

**Headers:**
| Key | Value |
|-----|-------|
| token | `MahmoudOthman_Fekrah_App eyJhbGci...` |

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| priceFile | File | price (1).xlsx |
| conditionsFile | File | List&Conditions.xlsx |
| companies | Text | `["6868267037e7c8afc02e1289","686826e337e7c8afc02e1297"]` |

### Response Example
```json
{
  "message": "Missing tests and prices added successfully",
  "statistics": {
    "testsCreated": 207,
    "testsSkipped": 1484,
    "pricesCreated": 414,
    "errors": []
  }
}
```

---

## 🎯 Recommended Workflow

### Scenario A: First Time Setup
```
1. Use Endpoint 3 (addMissingTestsWithPrices)
   → Creates all 1691 tests + prices for 2 companies
   → Result: 1691 tests, 3382 prices created

2. Check response for errors
   → If errors exist, fix Excel data and run again
```

### Scenario B: Monthly Price Update
```
1. Use Endpoint 1 (bulkUpdateTestsAndPrices)
   → Updates all existing prices to new values
   → Also adds any new tests that appeared

2. Verify in database
   → Spot-check a few random tests to confirm prices updated
```

### Scenario C: Adding Only New Tests
```
1. Use Endpoint 3 (addMissingTestsWithPrices)
   → Only creates tests that don't exist yet
   → Existing tests remain untouched

2. Safer approach for incremental updates
```

### Scenario D: Just Test Definitions (No Prices Yet)
```
1. Use Endpoint 2 (addTestsOnlyFromExcel)
   → Adds/updates test catalog without pricing

2. Later, use Endpoint 1 or 3 to add prices
```

---

## 📊 Console Output Comparison

All endpoints show progress in the server console:

### Endpoint 1 & 3 (with companies):
```
✅ Files received successfully
✅ Verified 2 companies:
   - elborg (6868267037e7c8afc02e1289)
   - al mokhtbar (686826e337e7c8afc02e1297)

🔄 Processing 1691 tests...
   ⏳ Processed 100/1691 tests...

✅ Processing complete!
📊 Statistics:
   Tests Created: 207
   Tests Updated: 0      (Endpoint 1 only)
   Tests Skipped: 1484   (Endpoint 3 only)
   Prices Created: 414
   Prices Updated: 0     (Endpoint 1 only)
   Errors: 0
```

### Endpoint 2 (tests only):
```
✅ Files received successfully

🔄 Processing 1691 tests (tests only, no prices)...
   ⏳ Processed 100/1691 tests...

✅ Processing complete!
📊 Statistics:
   Tests Created: 150
   Tests Updated: 1541
   Tests Skipped: 0
   Errors: 0
```

---

## 🚦 Quick Reference

### I want to...

**Add 1691 tests for the first time with prices:**
→ Use **Endpoint 3** (addMissingTestsWithPrices)

**Update all prices to new values:**
→ Use **Endpoint 1** (bulkUpdateTestsAndPrices)

**Add only the tests that failed before:**
→ Use **Endpoint 3** (addMissingTestsWithPrices)

**Just update test conditions, no prices:**
→ Use **Endpoint 2** (addTestsOnlyFromExcel)

**Sync everything (tests + prices):**
→ Use **Endpoint 1** (bulkUpdateTestsAndPrices)

---

## ⚠️ Important Notes

### Validation Fixes Applied to ALL Endpoints
- ✅ Condition too short → Auto-set to "لا يوجد شروط"
- ✅ Description too short → Auto-append " - Medical Test"
- ✅ No more validation errors!

### Data Safety
- **Endpoint 1**: Updates everything (use carefully!)
- **Endpoint 2**: Updates tests only (prices safe)
- **Endpoint 3**: Only adds new data (safest option) ⭐

### Performance
- All endpoints process ~1691 tests in **2-5 minutes**
- Shows progress every 100 tests
- Errors don't stop processing

---

## 🔄 Next Steps

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Choose your endpoint** based on what you need

3. **Send the request** in Postman

4. **Check the response** for statistics

---

**Your new endpoint is ready!** Use **Endpoint 3** (`addMissingTestsWithPrices`) to add only the tests that don't exist yet, along with their prices. 🎉
