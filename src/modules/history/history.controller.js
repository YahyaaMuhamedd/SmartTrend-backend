import { historyModel } from "../../../DataBase/models/patientHistory.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";

const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000 ;



//& Get All History:
export const getAllHistory= catchError(
   async(req , res , next)=>{
      let result = await historyModel.find() ;
      let apiFeature = new ApiFeature(historyModel.find(), req.query ).pagination().fields().search().filter().sort();
      const history = await apiFeature.mongooseQuery;

      if(!history.length) return next(new AppError("History is Empty" , 404))

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
      } ;
      if(currentPag <=  numberOfPages  && prevPage != 0 ){
         metadata.prevPage  = prevPage
      } ;

      res.json({message:"success" , results:result.length ,  metadata: metadata ,  history}) ;
   }
)



//& Add New Company :
export const addHistory = catchError(
   async(req , res , next)=>{
      const {history_disease , history_medicines , history_surgeries} = req.body ;
      const user = req.user._id ;
      let history = await historyModel.findOne({user}) ;

      //& Check On Size File Media Before Convert From k-byte to Mega byte :
      let images = [] ;
      if(req.files.length > 0){
         req.files.map((file)=>{
            if((file.size > uploadImageSize)){
               return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
            } ;
            images.push(file.filename) ;
         })
      } ;

      if(history){
         if(history_disease) history.history_disease = history_disease ;
         if(history_medicines) history.history_medicines = history_medicines ;
         if(history_surgeries) history.history_surgeries = history_surgeries ;

         if(images.length > 0) history.images = images ;
         await history.save() ;
      } else{
         history = await historyModel.create({ 
            history_disease , 
            history_medicines , 
            history_surgeries , 
            images , 
            user
         }) ;
      }

      !history && next(new AppError("The History has not been added.", 404) ) ;
      history &&  res.json({message:"success" , history}) ;
   }
)



//& Get Single History :
export const getHistorySpecificUser = catchError(
   async(req , res , next)=>{
      const history = await historyModel.findOne({user:req.user._id}) ;
      !history && next(new AppError("History Not Exist" , 404))
      history && res.json({message:"success" , history})
   }
)



//& Delete History :
export const deleteHistory = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const history = await historyModel.findByIdAndDelete(id) ;

      if(!history) return next(new AppError("History Not Exist" , 404))
      history && res.json({message:"success" , history })
   }
)