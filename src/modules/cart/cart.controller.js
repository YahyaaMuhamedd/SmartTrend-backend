import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { cartModel } from "../../../DataBase/models/cart.model.js";
import { priceModel } from "../../../DataBase/models/price.model.js";







//& Get All Cart :
export const getAllCart = catchError(
   async(req , res , next)=>{
      let result = await cartModel.find();

      //^ Merge Params
      let filterObj = {};

      let apiFeature = new ApiFeature(cartModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const carts = await apiFeature.mongooseQuery.select("");

      if(!carts.length) return next(new AppError("Carts is Empty" , 404))

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
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  carts}) ;
   }


)


//& Get Logged User Cart :
export const getLoggedUserCart = catchError(
   
   async(req , res , next)=>{
      const cart = await cartModel.findOne({user:req.user._id}) ;

      !cart && next(new AppError("Empty Cart" , 404))
      cart && res.json({message:"success" ,  cart}) ;
   }
)



//& Add Test To Cart  :
export const addTestToCart = catchError(
   async(req , res , next)=>{
      const {test_id ,  company_id} = req.body ;

      const priceTestExist = await priceModel.findOne({test:test_id , company:company_id}) ;
      if(!priceTestExist)  return next(new AppError("Price Test Not Found in This Company" , 404)) ;

      const cartExist = await cartModel.findOne({user:req.user._id}) ;
      if(!cartExist){
         const cart = new cartModel({
            user:req.user._id ,
            cartItems:[
               {
                  test:test_id ,
                  price:priceTestExist._id ,
               }
            ] ,
            company :company_id ,
         })

         await cart.save() ;
         res.json({message:"success" , cart})
      }else{


         //& check are You sure don`t Added same test in same Order :
         let item = cartExist.cartItems.find((item)=>{
            return item?.test._id.toString() == test_id
         })
         if(item){
            return next(new AppError("Test Already Exist In Cart"))
         }

         //& check are You sure don`t Added test in Two different Company in same Order :
         let company = cartExist?.cartItems.find((ele)=>{
            return ele?.price.company.toString() == company_id
         })
         if(!company && cartExist?.cartItems.length > 0){
            return next(new AppError("it Must be the same company, Should be First Clear Cart And Added Test From This Company"))
         }

         
         cartExist.cartItems.push({
            test:test_id ,
            price: priceTestExist._id
         })
         await cartExist.save() ;

         res.json({message:"success" , cartExist})
      }
   }
)





//& Add All Tests To Cart By Logged User :
export const addAllTestsToCart = catchError(
   async(req , res , next)=>{
      const {listIdTest ,  company_id} = req.body ;
      
      let priceList = [] ;
      for (const element of listIdTest) {
         const priceTestExist = await priceModel.findOne({test:element , company:company_id}) ;
         if(!priceTestExist)  return next(new AppError(`Price Test Not Found in This Company id = ${element}` , 404)) ;
         priceList.push(priceTestExist)
      }

      let cartExist = await cartModel.findOne({user:req.user._id}) ;
      let cartItems = priceList.map((price)=>{
         return {
               test:price.test ,
               price:price
            }
      })

      if(!cartExist){
         cartExist = new cartModel({
            user:req.user._id ,
            company :company_id ,
            cartItems
         })
         await cartExist.save() ;
      }
      else{
         cartExist.cartItems = cartItems
         cartExist.company = company_id
         await cartExist.save() ;
      }
      res.json({message:"success" , cartExist})
   }
)




//& Add All Tests To Cart By Admin to Specific User :
export const addAllTestsToCartByAdmin = catchError(
   async(req , res , next)=>{
      const {listIdTest ,  companyId , userId} = req.body ;
      
      let priceList = [] ;
      for (const element of listIdTest) {
         const priceTestExist = await priceModel.findOne({test:element , company:companyId}) ;
         if(!priceTestExist)  return next(new AppError(`Price Test Not Found in This Company ` , 404)) ;
         priceList.push(priceTestExist)
      }
      let cartItems = priceList.map((price)=>{
         return {
               test:price.test ,
               price:price
            }
      })

      //^ Delete User Cart  :
      await cartModel.findOneAndDelete({user:userId}) ;

      const cart = new cartModel({
         user:userId ,
         company :companyId ,
         cartItems
      })
      await cart.save() ;

      res.json({message:"success" , cart})
   }
)





//& Remove Test From Cart  :
export const removeTestFromCart = catchError(
   async (req, res, next) => {
      const { id } = req.params;

      // التأكد من وجود السلة أولاً
      const cartExist = await cartModel.findOne({ user: req.user._id });
      if (!cartExist) return next(new AppError("Empty Cart", 404));

      // البحث عن العنصر وحذفه باستخدام filter
      const updatedCartItems = cartExist.cartItems.filter(item => item?.test._id.toString() !== id);

      // إذا لم يتم العثور على العنصر في السلة
      if (updatedCartItems.length === cartExist.cartItems.length) {
         return next(new AppError("Test Already Deleted", 404));
      }

      // تحديث السلة أو حذفها إذا كانت فارغة
      cartExist.cartItems = updatedCartItems;

      // حفظ التحديثات
      await cartExist.save();


      
      if (cartExist.cartItems.length === 0) {
         await cartModel.findOneAndDelete({ user: req.user._id });
      }


      res.json({ message: "success", cartExist });
   }
);




//&  Clear Logged User Cart :
export const clearLoggedUserCart = catchError(
   async(req , res , next)=>{
      const cart = await cartModel.findOneAndDelete({user:req.user._id} , {new:true}) ;

      !cart && next(new AppError(" Empty Cart " , 404))
      cart &&  res.json({message:"success" , cart})
   }
)
