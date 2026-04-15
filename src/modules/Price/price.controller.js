import { priceModel } from "../../../DataBase/models/price.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { companyModel } from "../../../DataBase/models/company.model.js";
import { testModel } from "../../../DataBase/models/test.model.js";
import { importExcelData } from "../../services/importExcel.js";
import slugify from "slugify";

const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000;


//& Get All Price :
export const getAllPrice = catchError(
   async(req , res , next)=>{
      const result = await priceModel.find();

      const apiFeature = new ApiFeature(priceModel.find(), req.query ).pagination().fields().search().filter().sort();
      const prices = await apiFeature.mongooseQuery.select("");

      if(!prices.length) return next(new AppError("Prices is Empty" , 404))

      const currentPag = apiFeature.pageNumber ;
      const numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      const limit = apiFeature.limit  ;
      const nextPage = numberOfPages - apiFeature.pageNumber ;
      const prevPage = (numberOfPages - nextPage) - 1 ;

      const metadata = {
         currentPag: currentPag ,
         numberOfPages: numberOfPages || 1 ,
         limit: limit ,
         }

         if(nextPage >  numberOfPages  && nextPage != 0){
            metadata.nextPage  = nextPage
         }
         if(currentPag <=  numberOfPages  && prevPage != 0 ){
            metadata.prevPage  = prevPage
         }
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  prices}) ;
   }
)




//& Get All Price By Company Id:
export const getPriceCompany = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      
      //^ Merge Params
      let filterObj = {company:id};
      const apiFeature = new ApiFeature(priceModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const prices = await apiFeature.mongooseQuery.select("");

      if(!prices.length) return next(new AppError("Prices is Empty" , 404))

      const currentPag = apiFeature.pageNumber ;
      const numberOfPages = Math.ceil(prices.length  / apiFeature.limit)  ;
      const limit = 2  ;
      const nextPage = numberOfPages - apiFeature.pageNumber ;
      const prevPage = (numberOfPages - nextPage) - 1 ;

      const metadata = {
         currentPag: currentPag ,
         numberOfPages: numberOfPages || 1 ,
         limit: limit ,
         }

         if(nextPage >  numberOfPages  && nextPage != 0){
            metadata.nextPage  = nextPage
         }
         if(currentPag <=  numberOfPages  && prevPage != 0 ){
            metadata.prevPage  = prevPage
         }
      res.json({message:"success" , result:prices.length ,  metadata: metadata ,  prices}) ;
   }
)




//& Get Single Price :
export const getSinglePrice = catchError(
   async(req , res , next)=>{
      const{id} = req.params ;

      const price = await priceModel.findById(id) ;

      !price && next(new AppError("Not Found Price" , 404))
      price && res.json({message:"success" , price})
   }
)




//& Add Test Price :
export const addTestPrice = catchError(
   async(req , res , next)=>{
      const {contract_Price , price , priceAfterDiscount ,  company , test} = req.body ;

      
      const testExist = await testModel.findById(test) ;
      if(!testExist) return next(new AppError("Test Not Exist", 404) ) ;
      
      
      const companyExist = await companyModel.findById(company) ;
      if(!companyExist) return next(new AppError("Company Not Exist", 404) ) ;
      
      
      const priceExist = await priceModel.findOne({company , test}) ;
      if( priceExist ) return next(new AppError("Test Already Added To Price In This Company", 404) ) ;
      
      const testName = testExist.name ;
      const companyName = companyExist.name ;
      const discount = (( price - priceAfterDiscount ) / price ) * 100 ;
      
      const newPrice = await priceModel.create({
         discount ,
         testName ,
         companyName ,

         price ,
         contract_Price ,
         test ,
         company ,
         priceAfterDiscount ,
         createdBy:req.user._id
      }) ;
      
      !newPrice && next(new AppError("Price Not Added", 404) ) ;
      newPrice &&  res.json({message:"success" , newPrice}) ;
   }
)




//& Update Price :
export const updatePrice = catchError(
   async(req , res , next)=>{
      const {test , company , contract_Price , price , priceAfterDiscount } = req.body ;


      const priceExist = await priceModel.findOne({test , company}) ;
      if(!priceExist) return next(new AppError("Price Not Exist", 404) ) ;


      const discount = (( price - priceAfterDiscount ) / price ) * 100 ;
         priceExist.contract_Price = contract_Price ,  
         priceExist.price = price , 
         priceExist.priceAfterDiscount = priceAfterDiscount ,  
         priceExist.discount = discount
      await priceExist.save() ;
      res.json({message:"success" , updatePrice:priceExist}) ;
   }
)


//& Update Price By Id :
export const updatePriceById = catchError(
   async(req , res , next)=>{
      const {contract_Price , price , priceAfterDiscount } = req.body ;
      const {id} = req.params ;

      const priceExist = await priceModel.findById(id) ;
      if(!priceExist) return next(new AppError("Price Not Exist", 404) ) ;


      const discount = (( price - priceAfterDiscount ) / price ) * 100 ;
         priceExist.contract_Price = contract_Price ,  
         priceExist.price = price , 
         priceExist.priceAfterDiscount = priceAfterDiscount ,  
         priceExist.discount = discount
      await priceExist.save() ;
      res.json({message:"success" , updatePrice:priceExist}) ;
   }
)



//& Delete Price :
export const deletePrice = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const price = await priceModel.findByIdAndDelete(id , {new:true}) ;

      !price && next(new AppError("Price Not Exist" , 404))
      price && res.json({message:"success" , price})
   }
)




//& Add All Test Price By Excel Sheet :
export const addTestPriceSheetExcelToDatabase = catchError(
   async(req , res , next)=>{
      const {company} = req.body ;
      if(!req.file) return next(new AppError("Please Choose Excel Sheet" , 404))

      if((req.file.size > uploadImageSize)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      const excelPath = req.file.path ;
      const data = await importExcelData(excelPath) ;
      

      for (let ele of data) {
         const name = ele.name ;
         const price = ele.price ;
         const priceAfterDiscount = ele.priceAfterDiscount ;

         const testExist = await testModel.findOne({name}) ;
         if(!testExist) return next(new AppError(`Test Not Exist [${name}]`, 404) ) ;
         
         const test = testExist._id ;
         
         const companyExist = await companyModel.findById(company) ;
         if(!companyExist) return next(new AppError("Company Not Exist", 404) ) ;
         
         
         const priceExist = await priceModel.findOne({company , test}) ;
         if( priceExist ) return next(new AppError("Test Already Added To Price In This Company", 404) ) ;
         


         ele.test = test ;
         ele.company = company ;
         ele.price = price ;
         ele.priceAfterDiscount = Math.round(priceAfterDiscount) ;
         ele.testName = testExist.name ;
         ele.companyName = companyExist.name ;
         ele.createdBy = req.user._id ;
         ele.discount = Math.round((( price - priceAfterDiscount ) / price ) * 100 ) ;
      }
      
      const tests = await priceModel.insertMany(data) ;
      res.json({message:"Insert Tests Successfully 🥰"})
   }
) ;


//& Bulk Update Tests and Prices from Excel Sheets (with conditions support):
export const bulkUpdateTestsAndPrices = catchError(
   async(req , res , next)=>{
      const { companies } = req.body ;

      // Check for 4 files: test price, test conditions, radiology price, radiology conditions
      if(!req.files || !req.files.testPriceFile || !req.files.testConditionsFile ||
         !req.files.radiologyPriceFile || !req.files.radiologyConditionsFile) {
         return next(new AppError("Please upload all 4 Excel files (testPriceFile, testConditionsFile, radiologyPriceFile, radiologyConditionsFile)" , 400))
      }

      // Parse companies from string to array
      let companiesArray;
      try {
         companiesArray = typeof companies === 'string' ? JSON.parse(companies) : companies;
      } catch (error) {
         return next(new AppError("Invalid companies format. Must be a JSON array" , 400))
      }

      if(!companiesArray || !Array.isArray(companiesArray) || companiesArray.length === 0) {
         return next(new AppError("Please provide at least one company ID" , 400))
      }

      // Extract file paths from uploaded files (multer returns arrays)
      const testPriceFilePath = req.files.testPriceFile[0].path ;
      const testConditionsFilePath = req.files.testConditionsFile[0].path ;
      const radiologyPriceFilePath = req.files.radiologyPriceFile[0].path ;
      const radiologyConditionsFilePath = req.files.radiologyConditionsFile[0].path ;

      console.log('✅ Files received successfully');
      console.log('   Test Price file:', testPriceFilePath);
      console.log('   Test Conditions file:', testConditionsFilePath);
      console.log('   Radiology Price file:', radiologyPriceFilePath);
      console.log('   Radiology Conditions file:', radiologyConditionsFilePath);

      // Read all 4 Excel files
      const testPriceData = await importExcelData(testPriceFilePath) ;
      const testConditionsData = await importExcelData(testConditionsFilePath) ;
      const radiologyPriceData = await importExcelData(radiologyPriceFilePath) ;
      const radiologyConditionsData = await importExcelData(radiologyConditionsFilePath) ;

      // Combine test and radiology data
      const priceData = [...testPriceData, ...radiologyPriceData];
      const conditionsData = [...testConditionsData, ...radiologyConditionsData];

      console.log(`📊 Total tests to process: ${testPriceData.length} (tests) + ${radiologyPriceData.length} (radiology) = ${priceData.length}`);

      // Continue with existing logic...

      // Create a map of test names to conditions
      const conditionsMap = new Map();
      conditionsData.forEach(row => {
         const testName = String(row['Object Name'] || '').toLowerCase().trim();
         const condition = row['Conditions'] || '';
         if (testName) {
            conditionsMap.set(testName, condition);
         }
      });

      // Verify all companies exist
      const companiesData = await companyModel.find({ _id: { $in: companiesArray } });
      if (companiesData.length !== companiesArray.length) {
         return next(new AppError("One or more companies not found" , 404))
      }

      console.log(`✅ Verified ${companiesData.length} companies:`);
      companiesData.forEach(c => console.log(`   - ${c.name} (${c._id})`));

      // Statistics
      const stats = {
         testsCreated: 0,
         testsUpdated: 0,
         pricesCreated: 0,
         pricesUpdated: 0,
         errors: []
      };

      console.log(`\n🔄 Processing ${priceData.length} tests...`);
      let processedCount = 0;

      // Process each test
      for (const row of priceData) {
         const testName = String(row.name || '').toLowerCase().trim();

         if (!testName) continue;

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
                  createdBy: req.user._id,
                  isActive: true
               });
               stats.testsCreated++;
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
               }
            }

            // Process prices for each company
            for (const companyData of companiesData) {
               const existingPrice = await priceModel.findOne({
                  test: test._id,
                  company: companyData._id
               });

               const discount = price > 0 ? Math.floor(((price - priceAfterDiscount) / price) * 100) : 0;

               if (existingPrice) {
                  // Update existing price
                  existingPrice.price = price;
                  existingPrice.priceAfterDiscount = priceAfterDiscount;
                  existingPrice.contract_Price = contract_Price;
                  existingPrice.discount = discount;
                  existingPrice.testName = testName;
                  existingPrice.companyName = companyData.name;
                  await existingPrice.save();
                  stats.pricesUpdated++;
               } else {
                  // Create new price
                  await priceModel.create({
                     testName: testName,
                     companyName: companyData.name,
                     price: price,
                     priceAfterDiscount: priceAfterDiscount,
                     contract_Price: contract_Price,
                     discount: discount,
                     test: test._id,
                     company: companyData._id,
                     createdBy: req.user._id
                  });
                  stats.pricesCreated++;
               }
            }

         } catch (error) {
            stats.errors.push({ testName, error: error.message });
            console.error(`❌ Error processing "${testName}":`, error.message);
         }

         processedCount++;
         if (processedCount % 100 === 0) {
            console.log(`   ⏳ Processed ${processedCount}/${priceData.length} tests...`);
         }
      }

      console.log('\n✅ Processing complete!');
      console.log(`📊 Statistics:`);
      console.log(`   Tests Created: ${stats.testsCreated}`);
      console.log(`   Tests Updated: ${stats.testsUpdated}`);
      console.log(`   Prices Created: ${stats.pricesCreated}`);
      console.log(`   Prices Updated: ${stats.pricesUpdated}`);
      console.log(`   Errors: ${stats.errors.length}\n`);

      res.json({
         message: "Bulk update completed successfully",
         statistics: stats
      })
   }
) ;


//& Add Tests Only from Excel Sheets (without prices):
export const addTestsOnlyFromExcel = catchError(
   async(req , res , next)=>{
      if(!req.files || !req.files.testPriceFile || !req.files.testConditionsFile ||
         !req.files.radiologyPriceFile || !req.files.radiologyConditionsFile) {
         return next(new AppError("Please upload all 4 Excel files (testPriceFile, testConditionsFile, radiologyPriceFile, radiologyConditionsFile)" , 400))
      }

      // Extract file paths from uploaded files (multer returns arrays)
      const testPriceFilePath = req.files.testPriceFile[0].path ;
      const testConditionsFilePath = req.files.testConditionsFile[0].path ;
      const radiologyPriceFilePath = req.files.radiologyPriceFile[0].path ;
      const radiologyConditionsFilePath = req.files.radiologyConditionsFile[0].path ;

      console.log('✅ Files received successfully');
      console.log('   Test Price file:', testPriceFilePath);
      console.log('   Test Conditions file:', testConditionsFilePath);
      console.log('   Radiology Price file:', radiologyPriceFilePath);
      console.log('   Radiology Conditions file:', radiologyConditionsFilePath);

      // Read all 4 Excel files
      const testPriceData = await importExcelData(testPriceFilePath) ;
      const testConditionsData = await importExcelData(testConditionsFilePath) ;
      const radiologyPriceData = await importExcelData(radiologyPriceFilePath) ;
      const radiologyConditionsData = await importExcelData(radiologyConditionsFilePath) ;

      // Combine test and radiology data
      const priceData = [...testPriceData, ...radiologyPriceData];
      const conditionsData = [...testConditionsData, ...radiologyConditionsData];

      console.log(`📊 Total tests to process: ${testPriceData.length} (tests) + ${radiologyPriceData.length} (radiology) = ${priceData.length}`);

      // Create a map of test names to conditions
      const conditionsMap = new Map();
      conditionsData.forEach(row => {
         const testName = String(row['Object Name'] || '').toLowerCase().trim();
         const condition = row['Conditions'] || '';
         if (testName) {
            conditionsMap.set(testName, condition);
         }
      });

      // Statistics
      const stats = {
         testsCreated: 0,
         testsSkipped: 0,
         testsUpdated: 0,
         errors: []
      };

      console.log(`\n🔄 Processing ${priceData.length} tests (tests only, no prices)...`);
      let processedCount = 0;

      // Process each test
      for (const row of priceData) {
         const testName = String(row.name || '').toLowerCase().trim();

         if (!testName) continue;

         try {
            // Get condition for this test
            let condition = conditionsMap.get(testName) || '';

            // Ensure condition meets minimum length (2 characters)
            if (condition.length < 2) {
               condition = 'لا يوجد شروط'; // "No conditions" in Arabic
            }

            // Ensure description meets minimum length (10 characters)
            let description = condition.length >= 10 ? condition.substring(0, 400) : `${condition} - Medical Test`;

            // Check if test already exists
            let test = await testModel.findOne({ name: testName });

            if (!test) {
               // Create new test
               const slug = slugify(testName);
               test = await testModel.create({
                  name: testName,
                  condition: condition,
                  description: description,
                  slug: slug,
                  createdBy: req.user._id,
                  isActive: true
               });
               stats.testsCreated++;
            } else {
               // Test already exists - skip or update
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
               } else {
                  stats.testsSkipped++;
               }
            }

         } catch (error) {
            stats.errors.push({ testName, error: error.message });
            console.error(`❌ Error processing "${testName}":`, error.message);
         }

         processedCount++;
         if (processedCount % 100 === 0) {
            console.log(`   ⏳ Processed ${processedCount}/${priceData.length} tests...`);
         }
      }

      console.log('\n✅ Processing complete!');
      console.log(`📊 Statistics:`);
      console.log(`   Tests Created: ${stats.testsCreated}`);
      console.log(`   Tests Updated: ${stats.testsUpdated}`);
      console.log(`   Tests Skipped: ${stats.testsSkipped}`);
      console.log(`   Errors: ${stats.errors.length}\n`);

      res.json({
         message: "Tests added successfully",
         statistics: stats
      })
   }
) ;


//& Add ONLY Missing Tests with Prices (Skip Existing Tests):
export const addMissingTestsWithPrices = catchError(
   async(req , res , next)=>{
      const { companies } = req.body ;

      if(!req.files || !req.files.testPriceFile || !req.files.testConditionsFile ||
         !req.files.radiologyPriceFile || !req.files.radiologyConditionsFile) {
         return next(new AppError("Please upload all 4 Excel files (testPriceFile, testConditionsFile, radiologyPriceFile, radiologyConditionsFile)" , 400))
      }

      // Parse companies from string to array
      let companiesArray;
      try {
         companiesArray = typeof companies === 'string' ? JSON.parse(companies) : companies;
      } catch (error) {
         return next(new AppError("Invalid companies format. Must be a JSON array" , 400))
      }

      if(!companiesArray || !Array.isArray(companiesArray) || companiesArray.length === 0) {
         return next(new AppError("Please provide at least one company ID" , 400))
      }

      // Extract file paths from uploaded files (multer returns arrays)
      const testPriceFilePath = req.files.testPriceFile[0].path ;
      const testConditionsFilePath = req.files.testConditionsFile[0].path ;
      const radiologyPriceFilePath = req.files.radiologyPriceFile[0].path ;
      const radiologyConditionsFilePath = req.files.radiologyConditionsFile[0].path ;

      console.log('✅ Files received successfully');
      console.log('   Test Price file:', testPriceFilePath);
      console.log('   Test Conditions file:', testConditionsFilePath);
      console.log('   Radiology Price file:', radiologyPriceFilePath);
      console.log('   Radiology Conditions file:', radiologyConditionsFilePath);

      // Read all 4 Excel files
      const testPriceData = await importExcelData(testPriceFilePath) ;
      const testConditionsData = await importExcelData(testConditionsFilePath) ;
      const radiologyPriceData = await importExcelData(radiologyPriceFilePath) ;
      const radiologyConditionsData = await importExcelData(radiologyConditionsFilePath) ;

      // Combine test and radiology data
      const priceData = [...testPriceData, ...radiologyPriceData];
      const conditionsData = [...testConditionsData, ...radiologyConditionsData];

      console.log(`📊 Total tests to process: ${testPriceData.length} (tests) + ${radiologyPriceData.length} (radiology) = ${priceData.length}`);

      // Create a map of test names to conditions
      const conditionsMap = new Map();
      conditionsData.forEach(row => {
         const testName = String(row['Object Name'] || '').toLowerCase().trim();
         const condition = row['Conditions'] || '';
         if (testName) {
            conditionsMap.set(testName, condition);
         }
      });

      // Verify all companies exist
      const companiesData = await companyModel.find({ _id: { $in: companiesArray } });
      if (companiesData.length !== companiesArray.length) {
         return next(new AppError("One or more companies not found" , 404))
      }

      console.log(`✅ Verified ${companiesData.length} companies:`);
      companiesData.forEach(c => console.log(`   - ${c.name} (${c._id})`));

      // Statistics
      const stats = {
         testsCreated: 0,
         testsSkipped: 0,
         pricesCreated: 0,
         errors: []
      };

      console.log(`\n🔄 Processing ${priceData.length} tests (adding only missing tests with prices)...`);
      let processedCount = 0;

      // Process each test
      for (const row of priceData) {
         const testName = String(row.name || '').toLowerCase().trim();

         if (!testName) continue;

         const price = Number(row.price) || 0;
         const priceAfterDiscount = Number(row.priceAfterDiscount) || 0;
         const contract_Price = Number(row.contract_Price) || 0;

         try {
            // Check if test already exists
            let test = await testModel.findOne({ name: testName });

            if (test) {
               // Test already exists - SKIP IT
               stats.testsSkipped++;
               processedCount++;
               continue;
            }

            // Test doesn't exist - CREATE IT
            let condition = conditionsMap.get(testName) || '';

            // Ensure condition meets minimum length (2 characters)
            if (condition.length < 2) {
               condition = 'لا يوجد شروط'; // "No conditions" in Arabic
            }

            // Ensure description meets minimum length (10 characters)
            let description = condition.length >= 10 ? condition.substring(0, 400) : `${condition} - Medical Test`;

            // Create new test
            const slug = slugify(testName);
            test = await testModel.create({
               name: testName,
               condition: condition,
               description: description,
               slug: slug,
               createdBy: req.user._id,
               isActive: true
            });
            stats.testsCreated++;

            // Create prices for this NEW test for each company
            for (const companyData of companiesData) {
               const discount = price > 0 ? Math.floor(((price - priceAfterDiscount) / price) * 100) : 0;

               await priceModel.create({
                  testName: testName,
                  companyName: companyData.name,
                  price: price,
                  priceAfterDiscount: priceAfterDiscount,
                  contract_Price: contract_Price,
                  discount: discount,
                  test: test._id,
                  company: companyData._id,
                  createdBy: req.user._id
               });
               stats.pricesCreated++;
            }

         } catch (error) {
            stats.errors.push({ testName, error: error.message });
            console.error(`❌ Error processing "${testName}":`, error.message);
         }

         processedCount++;
         if (processedCount % 100 === 0) {
            console.log(`   ⏳ Processed ${processedCount}/${priceData.length} tests...`);
         }
      }

      console.log('\n✅ Processing complete!');
      console.log(`📊 Statistics:`);
      console.log(`   Tests Created: ${stats.testsCreated}`);
      console.log(`   Tests Skipped (already exist): ${stats.testsSkipped}`);
      console.log(`   Prices Created: ${stats.pricesCreated}`);
      console.log(`   Errors: ${stats.errors.length}\n`);

      res.json({
         message: "Missing tests and prices added successfully",
         statistics: stats
      })
   }
) ;


//& Remove Tests NOT in Excel File (Cleanup):
export const removeTestsNotInExcel = catchError(
   async(req , res , next)=>{
      if(!req.files || !req.files.testPriceFile || !req.files.testConditionsFile ||
         !req.files.radiologyPriceFile || !req.files.radiologyConditionsFile) {
         return next(new AppError("Please upload all 4 Excel files (testPriceFile, testConditionsFile, radiologyPriceFile, radiologyConditionsFile)" , 400))
      }

      // Extract file paths from uploaded files (multer returns arrays)
      const testPriceFilePath = req.files.testPriceFile[0].path ;
      const testConditionsFilePath = req.files.testConditionsFile[0].path ;
      const radiologyPriceFilePath = req.files.radiologyPriceFile[0].path ;
      const radiologyConditionsFilePath = req.files.radiologyConditionsFile[0].path ;

      console.log('✅ Files received successfully');
      console.log('   Test Price file:', testPriceFilePath);
      console.log('   Test Conditions file:', testConditionsFilePath);
      console.log('   Radiology Price file:', radiologyPriceFilePath);
      console.log('   Radiology Conditions file:', radiologyConditionsFilePath);

      // Read all 4 Excel files
      const testPriceData = await importExcelData(testPriceFilePath) ;
      const testConditionsData = await importExcelData(testConditionsFilePath) ;
      const radiologyPriceData = await importExcelData(radiologyPriceFilePath) ;
      const radiologyConditionsData = await importExcelData(radiologyConditionsFilePath) ;

      // Combine test and radiology data
      const priceData = [...testPriceData, ...radiologyPriceData];
      const conditionsData = [...testConditionsData, ...radiologyConditionsData];

      console.log(`📊 Total tests in Excel: ${testPriceData.length} (tests) + ${radiologyPriceData.length} (radiology) = ${priceData.length}`);

      // Create a Set of all test names from Excel (for fast lookup)
      const excelTestNames = new Set();
      priceData.forEach(row => {
         const testName = String(row.name || '').toLowerCase().trim();
         if (testName) {
            excelTestNames.add(testName);
         }
      });

      console.log(`📊 Excel contains ${excelTestNames.size} unique tests`);

      // Get all tests from database
      const allDbTests = await testModel.find().select('_id name');
      console.log(`📊 Database contains ${allDbTests.length} tests`);

      // Find tests in DB that are NOT in Excel
      const testsToDelete = [];
      for (const dbTest of allDbTests) {
         const dbTestName = dbTest.name.toLowerCase().trim();
         if (!excelTestNames.has(dbTestName)) {
            testsToDelete.push(dbTest);
         }
      }

      console.log(`\n⚠️  Found ${testsToDelete.length} tests to DELETE (not in Excel)`);

      if (testsToDelete.length === 0) {
         return res.json({
            message: "No tests to delete. All database tests exist in Excel",
            statistics: {
               testsDeleted: 0,
               pricesDeleted: 0,
               testsInExcel: excelTestNames.size,
               testsInDatabase: allDbTests.length
            }
         });
      }

      // Log tests that will be deleted
      console.log('\n🗑️  Tests to be DELETED:');
      testsToDelete.slice(0, 20).forEach((test, index) => {
         console.log(`   ${index + 1}. ${test.name}`);
      });
      if (testsToDelete.length > 20) {
         console.log(`   ... and ${testsToDelete.length - 20} more`);
      }

      // Statistics
      const stats = {
         testsDeleted: 0,
         pricesDeleted: 0,
         errors: []
      };

      console.log('\n🔄 Deleting tests and their prices...');

      // Delete each test and its prices
      for (const test of testsToDelete) {
         try {
            // Delete all prices for this test
            const deletedPrices = await priceModel.deleteMany({ test: test._id });
            stats.pricesDeleted += deletedPrices.deletedCount || 0;

            // Delete the test
            await testModel.findByIdAndDelete(test._id);
            stats.testsDeleted++;

         } catch (error) {
            stats.errors.push({ testName: test.name, error: error.message });
            console.error(`❌ Error deleting "${test.name}":`, error.message);
         }
      }

      console.log('\n✅ Cleanup complete!');
      console.log(`📊 Statistics:`);
      console.log(`   Tests Deleted: ${stats.testsDeleted}`);
      console.log(`   Prices Deleted: ${stats.pricesDeleted}`);
      console.log(`   Errors: ${stats.errors.length}\n`);

      res.json({
         message: "Cleanup completed successfully",
         statistics: {
            testsDeleted: stats.testsDeleted,
            pricesDeleted: stats.pricesDeleted,
            testsInExcel: excelTestNames.size,
            testsInDatabase: allDbTests.length,
            testsRemaining: allDbTests.length - stats.testsDeleted,
            errors: stats.errors
         }
      })
   }
) ;


