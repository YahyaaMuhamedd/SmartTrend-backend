import { AppError } from "../utilities/AppError.js";
import { catchError } from "../utilities/catchError.js";




//& Authorization :
export const authorize = (...roles)=>{

   return  catchError(
      async (req , res , next)=>{
         let adminRole = roles.includes(req.user.role) ;
         if(!adminRole) return next(new AppError("Not Authorization Entered"))
         next()
      }
   )
}

