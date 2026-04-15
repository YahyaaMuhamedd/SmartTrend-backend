# Bulk Update Tests & Prices Guide

This guide explains how to update prices and add new tests to your SmartTrend medical testing platform using Excel files.

## 📋 Overview

You can update prices and tests using two methods:
1. **Standalone Script** - Run directly from command line
2. **API Endpoint** - Call from your application (Postman/frontend)

Both methods will:
- ✅ Create new tests if they don't exist
- ✅ Update existing test conditions
- ✅ Create or update prices for specified companies
- ✅ Handle 2 companies simultaneously (elborg & al mokhtbar)
- ✅ Provide detailed statistics on what was processed

---

## 📁 Excel Files Required

### 1. Price File (`price (1).xlsx`)
Contains test names and pricing information:
- **name**: Test name (e.g., "17-alpha hydroxyprogesterone in serum")
- **price**: Original price
- **priceAfterDiscount**: Discounted price
- **contract_Price**: Contract/wholesale price

### 2. Conditions File (`List&Conditions.xlsx`)
Contains test conditions:
- **Object Name**: Test name (must match price file)
- **Conditions**: Medical condition/description for the test

**Note**: Both files should have the same tests in the same order.

---

## 🚀 Method 1: Standalone Script

### Configuration

Before running the script, update these values in `bulkUpdatePricesAndTests.js`:

```javascript
// File paths (update if your Excel files are in different location)
const PRICE_FILE_PATH = 'c:\\Users\\10\\Downloads\\price (1).xlsx';
const CONDITIONS_FILE_PATH = 'c:\\Users\\10\\Downloads\\List&Conditions.xlsx';

// Company IDs (already configured for elborg & al mokhtbar)
const COMPANY_IDS = [
   '6868267037e7c8afc02e1289', // elborg company
   '686826e337e7c8afc02e1297'  // al mokhtbar company
];

// Admin user ID (get from your database - see below)
const ADMIN_USER_ID = '678e6677c43da8fb0f37e6c8';
```

### Getting Your Admin User ID

Run this command to find an admin user:
```bash
node -e "import('./DataBase/dbConnection.js'); import('./DataBase/models/user.model.js').then(m => m.userModel.findOne({role: 'admin'}).then(u => console.log('Admin ID:', u._id)));"
```

### Running the Script

```bash
node bulkUpdatePricesAndTests.js
```

### Expected Output

```
═══════════════════════════════════════
  BULK UPDATE TESTS & PRICES SCRIPT
═══════════════════════════════════════

✅ Connected to MongoDB successfully
📥 Reading Excel files...

Found 1691 tests in price file
Found 1691 tests in conditions file

🔍 Verifying companies...
✅ Companies verified:
   - elborg (6868267037e7c8afc02e1289)
   - al mokhtbar (686826e337e7c8afc02e1297)

🔄 Processing tests and prices...

✅ Created test: 17-alpha hydroxyprogesterone in serum
✅ Created test: abo grouping
🔄 Updated test: acetone in urine
   Processed 100/1691 tests...
   Processed 200/1691 tests...
   ...

✅ Processing complete!

═══════════════════════════════════════
           IMPORT STATISTICS
═══════════════════════════════════════
Tests Created:      856
Tests Updated:      835
Prices Created:     1245
Prices Updated:     2137
Errors:             0
═══════════════════════════════════════

🎉 All done! Closing database connection...
✅ Database connection closed
```

---

## 🌐 Method 2: API Endpoint

### Endpoint Details

**URL**: `POST /api/v1/price/bulkUpdateTestsAndPrices`

**Authentication**: Required (Admin only)

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body** (form-data):
- `priceFile`: Excel file (price (1).xlsx)
- `conditionsFile`: Excel file (List&Conditions.xlsx)
- `companies`: JSON array of company IDs

### Using Postman

1. Create a new POST request to:
   ```
   http://localhost:5000/api/v1/price/bulkUpdateTestsAndPrices
   ```

2. **Headers** tab:
   - Add `Authorization: Bearer YOUR_JWT_TOKEN`

3. **Body** tab:
   - Select `form-data`
   - Add fields:
     - `priceFile` (File): Upload `price (1).xlsx`
     - `conditionsFile` (File): Upload `List&Conditions.xlsx`
     - `companies` (Text):
       ```json
       ["6868267037e7c8afc02e1289", "686826e337e7c8afc02e1297"]
       ```

4. Click **Send**

### Response Example

**Success (200)**:
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

**Error (400)**:
```json
{
  "message": "Please upload both Excel files (priceFile and conditionsFile)"
}
```

**Error (404)**:
```json
{
  "message": "One or more companies not found"
}
```

---

## 🔍 How It Works

### For Each Test in Excel:

1. **Check Test Existence**
   - Searches database for test by name (case-insensitive)
   - If not found → Creates new test with condition
   - If found → Updates condition if changed

2. **Process Prices**
   - For each company in your list:
     - Checks if price exists for this test + company combo
     - If exists → Updates price, discount, contract price
     - If not → Creates new price entry

3. **Calculate Discount**
   - Automatically calculates: `discount = ((price - priceAfterDiscount) / price) * 100`

### Data Matching

- Test names are compared in **lowercase** to avoid case sensitivity issues
- Test names from both files should match exactly (ignoring case)
- Missing conditions default to empty string

---

## 📊 Database Changes

### Tests Table
- New tests added with:
  - `name`: From Excel
  - `condition`: From conditions file
  - `description`: First 400 chars of condition
  - `slug`: Auto-generated from name
  - `isActive`: true

### Prices Table
- For each test × company combination:
  - `testName`: Test name
  - `companyName`: Company name
  - `price`: Original price
  - `priceAfterDiscount`: Discounted price
  - `contract_Price`: Contract price
  - `discount`: Auto-calculated percentage

---

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running bulk operations
2. **Test Data**: Test with a small Excel file first (10-20 rows)
3. **Company IDs**: Verify company IDs exist in your database before running
4. **Admin Access**: Script requires admin user for `createdBy` field
5. **File Format**: Ensure Excel files match the expected column names exactly
6. **Performance**: Processing 1691 tests may take 2-5 minutes depending on server

---

## 🛠️ Troubleshooting

### "Company Not Exist"
- Verify company IDs in the script/API request
- Check companies exist:
  ```bash
  node -e "import('./DataBase/dbConnection.js'); import('./DataBase/models/company.model.js').then(m => m.companyModel.find().select('_id name').then(c => console.log(c)));"
  ```

### "MODULE_NOT_FOUND"
- Run `npm install` to install dependencies

### "Cannot find Excel file"
- Check file paths are correct (use double backslashes on Windows: `c:\\Users\\...`)
- Verify files exist at specified locations

### Script Hangs
- Check MongoDB connection in `.env` file
- Ensure database is accessible
- Check firewall/network settings

### Duplicate Test Name Error
- Tests are matched case-insensitively
- Check for duplicate names in Excel file
- Database enforces unique test names

---

## 📝 Adding More Companies

To process prices for additional companies:

**Script Method**:
```javascript
const COMPANY_IDS = [
   '6868267037e7c8afc02e1289', // elborg
   '686826e337e7c8afc02e1297', // al mokhtbar
   'NEW_COMPANY_ID_HERE'        // Add more
];
```

**API Method**:
```json
{
  "companies": [
    "6868267037e7c8afc02e1289",
    "686826e337e7c8afc02e1297",
    "NEW_COMPANY_ID_HERE"
  ]
}
```

---

## 🎯 Best Practices

1. **Dry Run First**: Test with a small subset of data
2. **Monitor Output**: Watch console for errors during processing
3. **Verify Results**: Check a few random tests in database after import
4. **Update Regularly**: Run periodically when prices change
5. **Log Statistics**: Keep track of what was created/updated

---

## 📞 Support

If you encounter issues:
1. Check error messages in statistics output
2. Verify Excel file format matches examples
3. Confirm company IDs are correct
4. Ensure database connection is working
5. Check user has admin privileges

---

## ✅ Quick Checklist

Before running:
- [ ] Backup database
- [ ] Excel files prepared with correct format
- [ ] Company IDs verified
- [ ] Admin user ID configured (for script method)
- [ ] MongoDB connection working
- [ ] Dependencies installed (`npm install`)

After running:
- [ ] Check statistics output
- [ ] Verify random tests in database
- [ ] Confirm prices updated correctly
- [ ] Check error list if any
- [ ] Test application functionality

---

**Last Updated**: 2026-01-25
**Version**: 1.0
