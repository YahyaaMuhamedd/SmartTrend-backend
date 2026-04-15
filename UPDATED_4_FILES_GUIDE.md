# 📁 Updated Bulk Import - 4 Files (Tests + Radiology)

## 🎯 What Changed?

All endpoints now accept **4 Excel files** instead of 2:

### Before (2 files):
- ❌ `priceFile` - All tests and radiology together
- ❌ `conditionsFile` - All conditions together

### Now (4 files):
- ✅ `testPriceFile` - Medical tests prices
- ✅ `testConditionsFile` - Medical tests conditions
- ✅ `radiologyPriceFile` - Radiology tests prices
- ✅ `radiologyConditionsFile` - Radiology tests conditions

---

## 📋 All Endpoints Support 4 Files

| Endpoint | Method | URL |
|----------|--------|-----|
| 1. Bulk Update | POST | `/api/v1/price/bulkUpdateTestsAndPrices` |
| 2. Tests Only | POST | `/api/v1/price/addTestsOnlyFromExcel` |
| 3. Missing Tests | POST | `/api/v1/price/addMissingTestsWithPrices` |
| 4. Cleanup | DELETE | `/api/v1/price/removeTestsNotInExcel` |

---

## 🚀 How to Use in Postman

### Common Configuration for ALL Endpoints

**Headers Tab:**
| Key | Value |
|-----|-------|
| token | `MahmoudOthman_Fekrah_App eyJhbGci...` |

**Body Tab (form-data):**

| Key | Type | Value | Description |
|-----|------|-------|-------------|
| `testPriceFile` | **File** | Select your test price Excel | Medical tests prices |
| `testConditionsFile` | **File** | Select your test conditions Excel | Medical tests conditions |
| `radiologyPriceFile` | **File** | Select your radiology price Excel | Radiology prices |
| `radiologyConditionsFile` | **File** | Select your radiology conditions Excel | Radiology conditions |
| `companies` | **Text** | `["6868267037e7c8afc02e1289","686826e337e7c8afc02e1297"]` | *(For endpoints 1 & 3 only)* |

**Important Notes:**
- All 4 files are **required** for all endpoints
- Make sure each field type is set to **"File"** (not Text)
- The `companies` field is only needed for endpoints that create/update prices

---

## 📝 Detailed Endpoint Configurations

### 1️⃣ Bulk Update Tests AND Prices

**URL**: `POST http://localhost:5000/api/v1/price/bulkUpdateTestsAndPrices`

**Body (form-data):**
```
testPriceFile          → [File] Your test prices Excel
testConditionsFile     → [File] Your test conditions Excel
radiologyPriceFile     → [File] Your radiology prices Excel
radiologyConditionsFile → [File] Your radiology conditions Excel
companies              → [Text] ["6868267037e7c8afc02e1289","686826e337e7c8afc02e1297"]
```

**What It Does:**
- Reads ALL 4 files
- Combines tests + radiology data
- Creates/updates tests from both files
- Creates/updates prices for both tests and radiology

**Response:**
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

**Console Output:**
```
✅ Files received successfully
   Test Price file: E:\...\testPrices.xlsx
   Test Conditions file: E:\...\testConditions.xlsx
   Radiology Price file: E:\...\radiologyPrices.xlsx
   Radiology Conditions file: E:\...\radiologyConditions.xlsx

📊 Total tests to process: 1200 (tests) + 491 (radiology) = 1691
✅ Verified 2 companies:
   - elborg (6868267037e7c8afc02e1289)
   - al mokhtbar (686826e337e7c8afc02e1297)

🔄 Processing 1691 tests...
   ⏳ Processed 100/1691 tests...
   ...

✅ Processing complete!
```

---

### 2️⃣ Add Tests Only (No Prices)

**URL**: `POST http://localhost:5000/api/v1/price/addTestsOnlyFromExcel`

**Body (form-data):**
```
testPriceFile          → [File] Your test prices Excel
testConditionsFile     → [File] Your test conditions Excel
radiologyPriceFile     → [File] Your radiology prices Excel
radiologyConditionsFile → [File] Your radiology conditions Excel
```
**NO companies field needed!**

**What It Does:**
- Reads ALL 4 files
- Combines tests + radiology data
- Creates/updates ONLY the test definitions
- Does NOT touch prices at all

---

### 3️⃣ Add ONLY Missing Tests with Prices

**URL**: `POST http://localhost:5000/api/v1/price/addMissingTestsWithPrices`

**Body (form-data):**
```
testPriceFile          → [File] Your test prices Excel
testConditionsFile     → [File] Your test conditions Excel
radiologyPriceFile     → [File] Your radiology prices Excel
radiologyConditionsFile → [File] Your radiology conditions Excel
companies              → [Text] ["6868267037e7c8afc02e1289","686826e337e7c8afc02e1297"]
```

**What It Does:**
- Reads ALL 4 files
- Combines tests + radiology data
- Creates NEW tests only (skips existing)
- Creates prices for those new tests

---

### 4️⃣ Remove Tests NOT in Excel (Cleanup)

**URL**: `DELETE http://localhost:5000/api/v1/price/removeTestsNotInExcel`

**Body (form-data):**
```
testPriceFile          → [File] Your test prices Excel
testConditionsFile     → [File] Your test conditions Excel
radiologyPriceFile     → [File] Your radiology prices Excel
radiologyConditionsFile → [File] Your radiology conditions Excel
```

**What It Does:**
- Reads ALL 4 files to get list of valid tests
- Finds tests in database NOT in any Excel file
- Deletes those tests and their prices
- ⚠️ **Dangerous operation - use carefully!**

---

## 📊 How Data is Combined

The system combines your 4 files like this:

```javascript
// Medical Tests
testPriceData:       [1200 tests with prices]
testConditionsData:  [1200 tests with conditions]

// Radiology Tests
radiologyPriceData:       [491 radiology with prices]
radiologyConditionsData:  [491 radiology with conditions]

// Combined (internally)
priceData = [...testPriceData, ...radiologyPriceData]
           = [1691 total tests]

conditionsData = [...testConditionsData, ...radiologyConditionsData]
                = [1691 total conditions]
```

The system processes all 1691 tests together, whether they're medical tests or radiology.

---

## 🎯 Example File Structure

### Your Files Should Look Like:

**testPriceFile.xlsx:**
| name | price | priceAfterDiscount | contract_Price |
|------|-------|-------------------|----------------|
| complete blood count | 100 | 80 | 60 |
| liver function test | 150 | 120 | 90 |

**testConditionsFile.xlsx:**
| Object Name | Conditions |
|-------------|-----------|
| complete blood count | لا يوجد شروط |
| liver function test | صيام 8 ساعات |

**radiologyPriceFile.xlsx:**
| name | price | priceAfterDiscount | contract_Price |
|------|-------|-------------------|----------------|
| chest x-ray | 200 | 160 | 120 |
| ct scan abdomen | 800 | 640 | 500 |

**radiologyConditionsFile.xlsx:**
| Object Name | Conditions |
|-------------|-----------|
| chest x-ray | لا يوجد شروط |
| ct scan abdomen | صيام 6 ساعات |

---

## ⚠️ Important Notes

### 1. All 4 Files are Required
Even if one category is empty, you must provide all 4 files. If you have no radiology tests, upload empty Excel files with just the headers.

### 2. File Naming
The actual file names don't matter, only the **field names** in Postman:
- Field must be named: `testPriceFile`
- Field must be named: `testConditionsFile`
- Field must be named: `radiologyPriceFile`
- Field must be named: `radiologyConditionsFile`

### 3. Column Names
Make sure your Excel files have the correct column names:
- **Price files**: `name`, `price`, `priceAfterDiscount`, `contract_Price`
- **Condition files**: `Object Name`, `Conditions`

### 4. Test Name Matching
- Test names must match between price and condition files
- Comparison is case-insensitive
- Leading/trailing spaces are trimmed automatically

---

## 🔄 Migration Steps

If you have existing requests in Postman with 2 files:

1. **Duplicate your old request**
2. **Update Body tab:**
   - Remove old `priceFile` field
   - Remove old `conditionsFile` field
   - Add 4 new file fields as shown above
3. **Upload your files:**
   - Split your data into test and radiology files
   - Upload all 4 files
4. **Send request**

---

## ✅ Quick Checklist

Before sending your request:
- [ ] All 4 file fields added to Body tab
- [ ] Each field type is set to "File" (not Text)
- [ ] Correct Excel files selected for each field
- [ ] `companies` field added (if using endpoint 1 or 3)
- [ ] Token added to Headers tab
- [ ] Server is running (`npm run dev`)

---

## 🎉 Ready to Use!

**Restart your server:**
```bash
npm run dev
```

**Then send your request with all 4 files!**

The system will automatically combine test and radiology data and process them together.

---

## 📞 Example Postman Configuration

```
POST http://localhost:5000/api/v1/price/bulkUpdateTestsAndPrices

Headers:
  token: MahmoudOthman_Fekrah_App eyJhbGci...

Body (form-data):
  testPriceFile:          [Select File: c:\Users\10\Downloads\test_prices.xlsx]
  testConditionsFile:     [Select File: c:\Users\10\Downloads\test_conditions.xlsx]
  radiologyPriceFile:     [Select File: c:\Users\10\Downloads\radiology_prices.xlsx]
  radiologyConditionsFile: [Select File: c:\Users\10\Downloads\radiology_conditions.xlsx]
  companies:              ["6868267037e7c8afc02e1289","686826e337e7c8afc02e1297"]
```

**All set!** 🚀
