import { cartModel } from "../../../DataBase/models/cart.model.js";
import { priceModel } from "../../../DataBase/models/price.model.js";
import { profileModel } from "../../../DataBase/models/profile.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import fs from "fs" ;
import path from "path" ;
const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000;




//& Get All Profiles :
export const getAllProfiles = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      let result = await profileModel.find();

      //^ Merge Params
      let filterObj = {};

      //^ Filter By Order Type :
      if(filter == "active"){
         filterObj = { isActive:true }
      }else if (filter == "blocked"){
         filterObj = { isActive:false }
      }

      let apiFeature = new ApiFeature(profileModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const profiles = await apiFeature.mongooseQuery;
      // const Profiles = await apiFeature.mongooseQuery.select("name service phone address isActive logo description discount start addresses");

      if(!profiles.length) return next(new AppError("Profiles is Empty" , 404))

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
      // res.json({message:"success" , results:profiles.length ,  metadata: metadata ,  Profiles }) ;
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  profiles}) ;
   }
)





//& Add New Profile :
export const addProfile = catchError(
   async(req , res , next)=>{
      const {name , description , discount  , listIdTest , company} = req.body ;
      
      const profileExist = await profileModel.findOne({name , company}) ;
      if(profileExist && profileExist.company._id.toString() === company) return next(new AppError("Profile is Already Exist" , 402)) ;


      let priceList = [] ;
      for (const element of listIdTest) {
         const priceTestExist = await priceModel.findOne({test:element , company:company}) ;
         if(!priceTestExist)  return next(new AppError(`Price Test Not Found in This Company ` , 404)) ;
         priceList.push(priceTestExist)
      }
      let testItems = priceList.map((price)=>{
         return {
               test:price.test ,
               price:price
            }
      })



      //& Check On Size File Media Before Convert From k-byte to Mega byte :
      if((req.file.size > uploadImageSize)) return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      const image = req.file.filename ;
      const createdBy = req.user._id
      const profile = await profileModel.create({
         name , 
         description ,
         discount ,
         testItems ,
         company,
         image ,
         createdBy
      })

      !profile && next(new AppError("Profile Not Added", 404) ) ;
      profile &&  res.json({message:"success" , profile}) ;
   }
)


//& Get Single Profile :
export const getSingleProfile = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const profile = await profileModel.findById(id) ;
      !profile && next(new AppError("Profile Not Exist" , 404))
      profile && res.json({message:"success" ,  profile})
   }
)



//& Active Profile :
export const activeProfile = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const profileExist = await profileModel.findById(id) ;
      let isActive ;
      if(profileExist){
         profileExist.isActive ? isActive = false : isActive = true
      }else{
         return next(new AppError("Profile Not Exist" , 404)) ;
      } ;

      const profile = await profileModel.findByIdAndUpdate(id , {isActive}) ;
      if(!profile) return next(new AppError("Profile Not Exist" , 404)) ;

      res.json({message:"success" , profile })
   }
)


//& Delete Profile :
export const deleteProfile = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const profile = await profileModel.findByIdAndDelete(id) ;
      if(!profile) return next(new AppError("Profile Not Exist" , 404))

      //! Delete Image from Server Disk :
      const fileName = "Uploads/Profile/" + path.basename(profile.image)
      const destPath = path.resolve(fileName)
      if(fs.existsSync(destPath)){
         fs.unlinkSync(path.resolve(fileName))
      }

      res.json({message:"success" , profile })
   }
)



//& Create  Profile Order :
export const createProfileOrder = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      
      const profileExist = await profileModel.findById(id) ;
      if(!profileExist)  return next(new AppError("Profile Not Exist" , 404)) ;

      const cartItems = profileExist.testItems

      //^ Delete User Cart  :
      await cartModel.findOneAndDelete({user:req.user._id}) ;

      const cart = new cartModel({
         user:req.user._id ,
         company :profileExist.company ,
         cartItems ,
         profilePrice: Math.round (profileExist.price) 
      })
      await cart.save() ;

      const newCart = await cartModel.findById(cart._id)
      
      res.json({message:"success" , cart:newCart})
   }
)