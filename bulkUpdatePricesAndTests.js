import xlsx from 'xlsx';
import mongoose from 'mongoose';
import { testModel } from './DataBase/models/test.model.js';
import { priceModel } from './DataBase/models/price.model.js';
import { companyModel } from './DataBase/models/company.model.js';
import slugify from 'slugify';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const PRICE_FILE_PATH = 'c:\\Users\\10\\Downloads\\price (1).xlsx';
const CONDITIONS_FILE_PATH = 'c:\\Users\\10\\Downloads\\List&Conditions.xlsx';
const COMPANY_IDS = [
   '6868267037e7c8afc02e1289', // elborg company
   '686826e337e7c8afc02e1297'  // al mokhtbar company
];

// Admin user ID for createdBy field (you can change this)
const ADMIN_USER_ID = '678e6677c43da8fb0f37e6c8'; // Replace with actual admin user ID if needed

// Statistics
const stats = {
   testsCreated: 0,
   testsUpdated: 0,
   pricesCreated: 0,
   pricesUpdated: 0,
   errors: []
};

// Connect to MongoDB
async function connectDB() {
   try {
      await mongoose.connect(process.env.URL_CONNECTION_DB_ONLINE_ATLAS);
      console.log('✅ Connected to MongoDB successfully');
   } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
   }
}

// Read Excel files
function readExcelFile(filePath) {
   const workbook = xlsx.readFile(filePath);
   const sheetName = workbook.SheetNames[0];
   const worksheet = workbook.Sheets[sheetName];
   return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
}

// Process tests and prices
async function processData() {
   console.log('📥 Reading Excel files...\n');

   const priceData = readExcelFile(PRICE_FILE_PATH);
   const conditionsData = readExcelFile(CONDITIONS_FILE_PATH);

   console.log(`Found ${priceData.length} tests in price file`);
   console.log(`Found ${conditionsData.length} tests in conditions file\n`);

   // Create a map of test names to conditions
   const conditionsMap = new Map();
   conditionsData.forEach(row => {
      const testName = String(row['Object Name'] || '').toLowerCase().trim();
      const condition = row['Conditions'] || '';
      if (testName) {
         conditionsMap.set(testName, condition);
      }
   });

   // Verify companies exist
   console.log('🔍 Verifying companies...');
   const companies = await companyModel.find({ _id: { $in: COMPANY_IDS } });

   if (companies.length !== COMPANY_IDS.length) {
      console.error('❌ Error: Not all companies found in database');
      console.log('Found companies:', companies.map(c => ({ id: c._id, name: c.name })));
      process.exit(1);
   }

   console.log('✅ Companies verified:');
   companies.forEach(company => {
      console.log(`   - ${company.name} (${company._id})`);
   });
   console.log('');

   // Process each test
   console.log('🔄 Processing tests and prices...\n');
   let processedCount = 0;

   for (const row of priceData) {
      const testName = String(row.name || '').toLowerCase().trim();

      if (!testName) {
         console.log(`⚠️  Skipping row - no test name`);
         continue;
      }

      const price = Number(row.price) || 0;
      const priceAfterDiscount = Number(row.priceAfterDiscount) || 0;
      const contract_Price = Number(row.contract_Price) || 0;

      try {
         // Get condition for this test
         let condition = conditionsMap.get(testName) || '';

         // Ensure condition meets minimum length (2 characters)
         if (condition.length < 2) {
            condition = 'لا يوجد شروط'; // "No conditions" in Arabic (more than 2 chars)
         }

         // Ensure description meets minimum length (10 characters)
         let description = condition.length >= 10 ? condition.substring(0, 400) : `${condition} - Medical Test`;

         // Find or create test
         let test = await testModel.findOne({ name: testName });

         if (!test) {
            // Create new test
            const slug = slugify(testName);
            test = await testModel.create({
               name: testName,
               condition: condition,
               description: description,
               slug: slug,
               createdBy: ADMIN_USER_ID,
               isActive: true
            });
            stats.testsCreated++;
            console.log(`✅ Created test: ${testName}`);
         } else {
            // Update test condition if changed
            let needsUpdate = false;

            if (test.condition !== condition) {
               test.condition = condition;
               needsUpdate = true;
            }

            if (!test.description || test.description.length < 10) {
               test.description = description;
               needsUpdate = true;
            }

            if (needsUpdate) {
               await test.save();
               stats.testsUpdated++;
               console.log(`🔄 Updated test: ${testName}`);
            }
         }

         // Process prices for each company
         for (const company of companies) {
            const existingPrice = await priceModel.findOne({
               test: test._id,
               company: company._id
            });

            const discount = price > 0 ? Math.floor(((price - priceAfterDiscount) / price) * 100) : 0;

            if (existingPrice) {
               // Update existing price
               existingPrice.price = price;
               existingPrice.priceAfterDiscount = priceAfterDiscount;
               existingPrice.contract_Price = contract_Price;
               existingPrice.discount = discount;
               existingPrice.testName = testName;
               existingPrice.companyName = company.name;
               await existingPrice.save();
               stats.pricesUpdated++;
            } else {
               // Create new price
               await priceModel.create({
                  testName: testName,
                  companyName: company.name,
                  price: price,
                  priceAfterDiscount: priceAfterDiscount,
                  contract_Price: contract_Price,
                  discount: discount,
                  test: test._id,
                  company: company._id,
                  createdBy: ADMIN_USER_ID
               });
               stats.pricesCreated++;
            }
         }

         processedCount++;
         if (processedCount % 100 === 0) {
            console.log(`   Processed ${processedCount}/${priceData.length} tests...`);
         }

      } catch (error) {
         console.error(`❌ Error processing test "${testName}":`, error.message);
         stats.errors.push({ testName, error: error.message });
      }
   }

   console.log('\n✅ Processing complete!\n');
}

// Print statistics
function printStats() {
   console.log('═══════════════════════════════════════');
   console.log('           IMPORT STATISTICS           ');
   console.log('═══════════════════════════════════════');
   console.log(`Tests Created:      ${stats.testsCreated}`);
   console.log(`Tests Updated:      ${stats.testsUpdated}`);
   console.log(`Prices Created:     ${stats.pricesCreated}`);
   console.log(`Prices Updated:     ${stats.pricesUpdated}`);
   console.log(`Errors:             ${stats.errors.length}`);
   console.log('═══════════════════════════════════════\n');

   if (stats.errors.length > 0) {
      console.log('❌ Errors encountered:');
      stats.errors.forEach((err, index) => {
         console.log(`   ${index + 1}. ${err.testName}: ${err.error}`);
      });
      console.log('');
   }
}

// Main execution
async function main() {
   console.log('═══════════════════════════════════════');
   console.log('  BULK UPDATE TESTS & PRICES SCRIPT   ');
   console.log('═══════════════════════════════════════\n');

   try {
      await connectDB();
      await processData();
      printStats();

      console.log('🎉 All done! Closing database connection...');
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
      process.exit(0);
   } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
   }
}

// Run the script
main();
