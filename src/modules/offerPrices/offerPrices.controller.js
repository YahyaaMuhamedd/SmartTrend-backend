import { AppError } from "../../utilities/AppError.js";
import { catchError } from "../../utilities/catchError.js";
import { priceModel } from "../../../DataBase/models/price.model.js";
import { companyModel } from "../../../DataBase/models/company.model.js";





//& Get All Offer Prices :
export const getOffers = catchError(
   async(req , res , next)=>{
      const{listIdTest} = req.body ;
      let priceList = [] ;
      
      //^ Check on elements in list id test of array And Handle Error :
      if(typeof listIdTest == "string") return next(new AppError("Test is Required in array []" , 404)) ;
      listIdTest.forEach(ele => {
         if(ele === "" || ele === " " ) return next(new AppError("Test is Required Not Empty String" , 404))
      });

      let companies = await companyModel.find();
      let listIdCompany = companies.map((ele)=>ele._id.toString()) ;


      for (const company of listIdCompany) {
         const currentCompany =  await companyModel.findById(company) ;
         let arr =  await priceModel.find({company , test :listIdTest});

         let totalPrice = arr.reduce((acc , current , index)=>{
            return acc + current.price ;
         } , 0)

         let totalPriceAfterDiscount = arr.reduce((acc , current , index)=>{
            return acc + current.priceAfterDiscount ;
         } , 0)

         if(arr.length >= 1) {
            priceList.push({ 
               companyName:currentCompany.name , 
               companyImage:currentCompany.logo , 
               testCount:arr.length , 
               total:{totalPrice , totalPriceAfterDiscount} ,
               arr
            })
         }
      }

      if(!priceList.length) return next(new AppError("Prices is Empty" , 404))
      res.json({message:"success" , priceList}) ;
   }
)



