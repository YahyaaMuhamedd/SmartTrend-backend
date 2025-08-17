import { advertModel } from "../../../DataBase/models/advert.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";

const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000;



//& Get All Adverts:
export const getAllAdverts= catchError(
   async(req , res , next)=>{
      let result = await advertModel.find();
      let apiFeature = new ApiFeature(advertModel.find(), req.query ).pagination().fields().search().filter().sort();
      const adverts = await apiFeature.mongooseQuery;

      if(!adverts.length) return next(new AppError("Adverts is Empty" , 404))

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
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  adverts}) ;
   }
)



//& Add New Company :
export const addAdvert = catchError(
   async(req , res , next)=>{
      const {title , message} = req.body ;
      const advertExist = await advertModel.findOne({title}) ;
      if(advertExist) return next(new AppError("Title Advert Already Exist" , 402)) ;

      //& Check On Size File Media Before Convert From k-byte to Mega byte :
      let image = "" ;
      if(req.file){
         if((req.file.size > uploadImageSize)){
            return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
         }
         image = req.file.filename ;
      }

      const createdBy = req.user._id

      const advert = await advertModel.create({
         title , 
         message , 
         image , 
         createdBy
      }) ;

      !advert && next(new AppError("The advert has not been added.", 404) ) ;
      advert &&  res.json({message:"success" , advert}) ;
   }
)



//& Get Single advert :
export const getSingleAdvert = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const advert = await advertModel.findById(id) ;

      !advert && next(new AppError("Advert Not Exist" , 404))
      advert && res.json({message:"success" , advert})
   }
)



//& Delete advert :
export const deleteAdvert = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const advert = await advertModel.findByIdAndDelete(id) ;
      const adverts = await advertModel.find() ;
      
      if(!advert) return next(new AppError("Advert Not Exist" , 404))
      advert && res.json({message:"success" , adverts })
   }
)