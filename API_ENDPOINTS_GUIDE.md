# Bulk Import API Endpoints Guide

## 🎯 Two Endpoints Available

### 1. Bulk Update Tests AND Prices
**Endpoint**: `POST /api/v1/price/bulkUpdateTestsAndPrices`

**What it does**:
- ✅ Creates new tests if they don't exist
- ✅ Updates existing tests with conditions
- ✅ Creates prices for specified companies
- ✅ Updates existing prices

**Use this when**: You want to update both tests AND prices together

---

### 2. Add Tests Only (NO Prices)
**Endpoint**: `POST /api/v1/price/addTestsOnlyFromExcel`

**What it does**:
- ✅ Creates new tests if they don't exist
- ✅ Updates existing tests with conditions
- ❌ Does NOT create or update prices

**Use this when**: You just want to add missing tests without touching prices

---

## 📝 How to Use in Postman

### Common Configuration for Both Endpoints

**Headers Tab:**
| Key | Value |
|-----|-------|
| token | `MahmoudOthman_Fekrah_App eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**Body Tab (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `priceFile` | **File** | `c:\Users\10\Downloads\price (1).xlsx` |
| `conditionsFile` | **File** | `c:\Users\10\Downloads\List&Conditions.xlsx` |

---

### Endpoint 1: Bulk Update Tests AND Prices

**URL**: `http://localhost:5000/api/v1/price/bulkUpdateTestsAndPrices`

**Additional Body Field:**
| Key | Type | Value |
|-----|------|-------|
| `companies` | **Text** | `["6868267037e7c8afc02e1289","686826e337e7c8afc02e1297"]` |

**Response Example:**
```json
{
  "message": "Bulk update completed successfully",
  "statistics": {
    "testsCreated": 856,
    "testsUpdated": 835,
    "pricesCreated": 1245,
    "pricesUpdated": 2137,
    "errors": []
  }
}
```

---

### Endpoint 2: Add Tests Only

**URL**: `http://localhost:5000/api/v1/price/addTestsOnlyFromExcel`

**Body Fields:** (NO companies field needed!)
- Just `priceFile` and `conditionsFile`

**Response Example:**
```json
{
  "message": "Tests added successfully",
  "statistics": {
    "testsCreated": 1200,
    "testsUpdated": 450,
    "testsSkipped": 41,
    "errors": []
  }
}
```

---

## 🔧 Validation Fixes Applied

The following issues have been fixed:

✅ **Condition field**: Now automatically adds "لا يوجد شروط" if empty or too short (< 2 chars)

✅ **Description field**: Now ensures minimum 10 characters by appending " - Medical Test" if needed

✅ **Error handling**: Errors are logged but don't stop the entire process

---

## 💡 Recommended Workflow

### Option 1: Do Everything at Once
1. Use **`bulkUpdateTestsAndPrices`** endpoint
2. This will create ALL tests and ALL prices in one go
3. Check the errors array in response for any issues

### Option 2: Two-Step Process
1. First, use **`addTestsOnlyFromExcel`** to create all tests
2. Then, use **`bulkUpdateTestsAndPrices`** to add prices
3. This approach helps isolate issues

---

## 🆘 Troubleshooting

### All validation errors showing?
- ✅ **Fixed!** The code now ensures all fields meet minimum requirements

### Some tests not created?
- Check the `errors` array in the response
- Each error shows the test name and reason

### Want to see progress?
- Check your server terminal/console
- You'll see live updates every 100 tests

---

## 📊 Console Output Example

When running either endpoint, you'll see:

```
✅ Files received successfully
   Price file: E:\...\price (1).xlsx
   Conditions file: E:\...\List&Conditions.xlsx

✅ Verified 2 companies:
   - elborg (6868267037e7c8afc02e1289)
   - al mokhtbar (686826e337e7c8afc02e1297)

🔄 Processing 1691 tests...
   ⏳ Processed 100/1691 tests...
   ⏳ Processed 200/1691 tests...
   ...

✅ Processing complete!
📊 Statistics:
   Tests Created: 856
   Tests Updated: 835
   Prices Created: 1245
   Prices Updated: 2137
   Errors: 0
```

---

**Now restart your server and try again!** 🚀

```bash
npm run dev
```
