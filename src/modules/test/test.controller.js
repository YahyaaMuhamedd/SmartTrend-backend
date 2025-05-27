import slugify from "slugify";
import { testModel } from "../../../DataBase/models/test.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { priceModel } from "../../../DataBase/models/price.model.js";
import { companyModel } from "../../../DataBase/models/company.model.js";


//& Get All Test :
export const getAllTest = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      let result = await testModel.find() ;

      //^ Merge Params
      let filterObj = {};

      //^ Filter By Order Type :
      if(filter == "active"){
         filterObj = { isActive:true }
      }else if (filter == "blocked"){
         filterObj = { isActive:false }
      }

      let apiFeature = new ApiFeature(testModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const tests = await apiFeature.mongooseQuery.select("");

      if(!tests.length) return next(new AppError("Tests is Empty" , 404))

      let currentPag = apiFeature.pageNumber ;
      let numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      let limit = apiFeature.limit  ;
      let nextPage = numberOfPages - apiFeature.pageNumber ;
      let prevPage = (numberOfPages - nextPage) - 1 ;

      let metadata = {
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
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  tests}) ;
   }
)





//& Get Test Count :
export const getTestCount = catchError(
   async(req , res , next)=>{

      //! All Tests :
      const tests = await testModel.find();


      //! Blocked Tests :
      const blockedTest = await testModel.find({isActive:false});
      
      
      //! Active Tests :
      const activeTest = await testModel.find({isActive:true});



      res.json({message:"success" , Test_Data :{
         tests:{count:tests.length} ,
         active_test:{count:activeTest.length } ,
         blocked_test:{count:blockedTest.length } ,
      }}) ;
   }
)





export const addTest = catchError(
   async(req , res , next)=>{
      const {name , condition , description  , company , priceAfterDiscount , price , contract_Price} = req.body ;

      
      const companyExist = await companyModel.findById(company) ;
      if(!companyExist) return next(new AppError("Company Not Exist" , 404))

      const testExist = await testModel.findOne({name}) ;
      if(testExist) return next(new AppError("Test Name Already Exist" , 404))


      //&Create slug By Test Name : 
      const slug = slugify(name) ;

      const newTest = await testModel.create({name , condition , description  , slug , createdBy:req.user._id}) ;
      if(!newTest)  next(new AppError("Test Not Added", 404) ) ;

      const testName = name
      const test = newTest._id
      const createdBy = req.user._id
      const companyName = companyExist.name
      const existPriceTestSameCompany = await priceModel.findOne({ test , company}) ;

      //! Handle Not Added Price Twice in Same Company :
      if(existPriceTestSameCompany){
         return next(new AppError("Test Already Added To Price In This Company" , 404)) ;
      }

      const discount = (( price - priceAfterDiscount ) / price ) * 100 ;
      const newTestAndPrice = await priceModel.create({testName , price , contract_Price , priceAfterDiscount , companyName  , test , company , discount , createdBy }) ;

      !newTestAndPrice && next(new AppError("Test Not Added", 404) ) ;
      newTestAndPrice &&  res.json({message:"success" ,newTest ,  newTestAndPrice}) ;
   }
)




//& Get Single Test :
export const getSingleTest = catchError(
   async(req , res , next)=>{
      const test = await testModel.findById(req.params?.id) ;

      !test && next(new AppError("Not Found Test" , 404))
      test && res.json({message:"success" , test})
   }
)




// & Update Test :
export const updateTest = catchError(
   async(req , res , next)=>{
      const {name , condition , description , isActive} = req.body ;
      const {id} = req.params ;

      const testExist = await testModel.findById(id) ;
      !testExist && next(new AppError("Test Not Exist", 404) ) ;

     // 1- Check new test name not exist in database and not same name to this id :
      const duplicateTest = await testModel.findOne({ name , _id: { $ne: id } });
      if (duplicateTest) return next(new AppError("Test name already exists", 400));

      // 2- if test name is changed , update test name in all prices :
      if (name !== testExist.name) {
         await priceModel.updateMany(
            { testName: testExist.name } ,
            { $set: { testName: name } }
         );
      }
      
      //&Create slug By Test Name : 
      const slug = slugify(name) ;

      const test = await testModel.findByIdAndUpdate(id , {name , condition , description , isActive , slug } , {new:true}) ;

      !test && next(new AppError("Test Not Added", 404) ) ;
      test && res.json({message:"success" , testUpdate:test}) ;
   }
)




//& Delete Test :
export const deleteTest = catchError(
   async(req , res , next)=>{

      const {id} = req.params ;
      const test = await testModel.findByIdAndDelete(id , {new:true}) ;

      //! Delete All Price In PriceModel By Test id :
      const deleteAllPriceTest = await priceModel.deleteMany({test:id})

      !test && next(new AppError("Not Found Test" , 404))
      test && res.json({message:"success" , test , })
   }
)






//& Add Test Only  :
export const addTestOnly = catchError(
   async(req , res , next)=>{
      const {name , condition , description} = req.body ;

      const testExist = await testModel.findOne({ name }) ;
      if(testExist) return next(new AppError("Test Already Exist", 404) ) ;


      //&Create slug By Test Name : 
      const slug = slugify(name) ;

      const test = await testModel.create({name , condition , description  , slug , createdBy:req.user._id}) ;

      !test && next(new AppError("Test Not Added", 404) ) ;
      test && res.json({message:"success" , test})
   }
)





//& Deleted All Prices :
export const deletedAllTests = catchError(
   async(req , res , next)=>{
      const tests = await testModel.deleteMany();
      res.json({message:"Successfully Deleted All Tests"})
   }
)