import { AppError } from "../utilities/AppError.js";
import { catchError } from "../utilities/catchError.js";




export const deleteOne =  (model , docOne , docAll)=>{
   return catchError(
      async(req , res , next)=>{
         let result = {};
         const{id} = req.params ;
         const document = await model.findByIdAndDelete(id) ;
         const documents = await model.find();
         result["Deleted" + docOne] = document
         result.Count = documents.length
         result["All_" + docAll] = documents
         !document &&  next(new AppError(`Not Found ${docAll}` , 404)) ;
         document && res.json({message:"success" , result}) ;
         // document && res.json({message:"success" , ...result}) ;
      }
   )
}


