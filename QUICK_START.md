# Quick Start - Bulk Price Update

## 🎯 Goal
Update 1691 test prices for elborg & al mokhtbar companies from Excel files.

---

## ⚡ Fastest Way (Standalone Script)

### 1. Get Your Admin User ID
```bash
node -e "import('./DataBase/dbConnection.js'); setTimeout(() => import('./DataBase/models/user.model.js').then(m => m.userModel.findOne({role: 'admin'}).then(u => { console.log('Admin ID:', u._id); process.exit(0); })), 2000);"
```

### 2. Update Script Configuration
Edit `bulkUpdatePricesAndTests.js` line 18:
```javascript
const ADMIN_USER_ID = 'PASTE_YOUR_ADMIN_ID_HERE';
```

### 3. Run Script
```bash
node bulkUpdatePricesAndTests.js
```

### 4. Wait for Completion
Should take 2-5 minutes for 1691 tests.

---

## 🌐 API Method (Postman)

### Endpoint
```
POST http://localhost:5000/api/v1/price/bulkUpdateTestsAndPrices
```

### Request
- **Headers**: `Authorization: Bearer YOUR_TOKEN`
- **Body** (form-data):
  - `priceFile`: Upload `c:\Users\10\Downloads\price (1).xlsx`
  - `conditionsFile`: Upload `c:\Users\10\Downloads\List&Conditions.xlsx`
  - `companies`: `["6868267037e7c8afc02e1289", "686826e337e7c8afc02e1297"]`

---

## ✅ What Gets Updated

For **each of 1691 tests**:
- Creates test if doesn't exist ✨
- Updates test condition from conditions file 📝
- Creates/updates price for **elborg** company 💰
- Creates/updates price for **al mokhtbar** company 💰

**Total operations**: ~3,382 price entries (1691 tests × 2 companies)

---

## 📊 Expected Results

```
Tests Created:      ~856 new tests
Tests Updated:      ~835 existing tests
Prices Created:     ~1,245 new prices
Prices Updated:     ~2,137 existing prices
```

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Can't find admin ID | Check if any users exist with `role: 'admin'` |
| Company not found | Verify IDs: `6868267037e7c8afc02e1289` and `686826e337e7c8afc02e1297` |
| Excel file not found | Check paths: `c:\Users\10\Downloads\` |
| Script hangs | Check MongoDB connection in `.env` |

---

## 📁 Files Created

1. ✅ `bulkUpdatePricesAndTests.js` - Standalone script
2. ✅ `BULK_UPDATE_GUIDE.md` - Full documentation
3. ✅ `QUICK_START.md` - This file
4. ✅ Updated `src/modules/Price/price.controller.js` - Added API endpoint
5. ✅ Updated `src/modules/Price/price.routes.js` - Added route

---

**Need help?** Read `BULK_UPDATE_GUIDE.md` for detailed instructions.
