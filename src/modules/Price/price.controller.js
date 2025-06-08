import { priceModel } from "../../../DataBase/models/price.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { companyModel } from "../../../DataBase/models/company.model.js";
import { testModel } from "../../../DataBase/models/test.model.js";


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




//& Add Price :
export const addPrice = catchError(
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
         price ,
         discount ,
         contract_Price ,
         test ,
         company ,
         testName ,
         companyName ,
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


//& Update Price :
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