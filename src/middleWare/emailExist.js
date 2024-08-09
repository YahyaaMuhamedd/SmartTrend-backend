import { userModel } from "../../DataBase/models/user.model.js";
import { AppError } from "../utilities/AppError.js";
import { catchError } from "../utilities/catchError.js";


export const emailExist = catchError(
   async(req , res , next)=>{
      let user = await userModel.findOne({$or:[
         {email:req.body.email}
      ]}) ;
      if(user) return next(new AppError("User Already Exist" , 409)) ;
      next() ;
   }
)