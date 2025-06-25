import { priceModel } from "../../../DataBase/models/price.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { companyModel } from "../../../DataBase/models/company.model.js";
import { testModel } from "../../../DataBase/models/test.model.js";
import { importExcelData } from "../../services/importExcel.js";
import { radiologyModel } from "../../../DataBase/models/radiology.model.js";

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


//& Add Radiology Price :
export const addRadiologyPrice = catchError(
   async(req , res , next)=>{
      const {contract_Price , price , priceAfterDiscount ,  company , test} = req.body ;

      
      const radiologyExist = await radiologyModel.findById(test) ;
      if(!radiologyExist) return next(new AppError("Radiology Not Exist", 404) ) ;
      
      
      const companyExist = await companyModel.findById(company) ;
      if(!companyExist) return next(new AppError("Company Not Exist", 404) ) ;
      
      
      const priceExist = await priceModel.findOne({company , test}) ;
      if( priceExist ) return next(new AppError("Radiology Already Added To Price In This Company", 404) ) ;
      
      const testName = radiologyExist.name ;
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
      if(!req.file) return next(new AppError("Please Choose Excel Sheet" , 404))

      if((req.file.size > uploadImageSize)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      const excelPath = req.file.path ;
      const data = await importExcelData(excelPath) ;
      

      for (let ele of data) {
         const test = ele.test ;
         const company = ele.company ;
         const price = ele.price ;
         const priceAfterDiscount = ele.priceAfterDiscount ;

         const testExist = await testModel.findById(test) ;
         if(!testExist) return next(new AppError("Test Not Exist", 404) ) ;
         
         
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



//& Add All Test Price By Excel Sheet :
export const addRadiologyPriceSheetExcelToDatabase = catchError(
   async(req , res , next)=>{
      if(!req.file) return next(new AppError("Please Choose Excel Sheet" , 404))

      if((req.file.size > uploadImageSize)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      const excelPath = req.file.path ;
      const data = await importExcelData(excelPath) ;
      

      for (let ele of data) {
         const test = ele.test ;
         const company = ele.company ;
         const price = ele.price ;
         const priceAfterDiscount = ele.priceAfterDiscount ;

         const radiologyExist = await radiologyModel.findById(test) ;
         if(!radiologyExist) return next(new AppError(`Radiology Not Exist:${test}`, 404) ) ;
         
         
         const companyExist = await companyModel.findById(company) ;
         if(!companyExist) return next(new AppError("Company Not Exist", 404) ) ;
         
         
         const priceExist = await priceModel.findOne({company , test}) ;
         if( priceExist ) return next(new AppError("Radiology Already Added To Price In This Company", 404) ) ;
         


         ele.test = test ;
         ele.company = company ;
         ele.price = price ;
         ele.priceAfterDiscount = Math.round(priceAfterDiscount) ;
         ele.testName = radiologyExist.name ;
         ele.companyName = companyExist.name ;
         ele.createdBy = req.user._id ;
         ele.discount = Math.round((( price - priceAfterDiscount ) / price ) * 100 ) ;
      }
      
      const tests = await priceModel.insertMany(data) ;
      res.json({message:"Insert Tests Successfully 🥰"})
   }
) ; 

