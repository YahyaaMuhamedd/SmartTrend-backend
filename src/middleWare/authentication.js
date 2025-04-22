import { userModel } from "../../DataBase/models/user.model.js";
import { AppError } from "../utilities/AppError.js";
import { catchError } from "../utilities/catchError.js";
import jwt from "jsonwebtoken";



//& Authentication :
export const protectedRoutes = catchError(
   async (req , res , next)=>{
      const{token} = req.headers ;

      //& 1- Check Token Exist And Bearer Token :
      if (!token || !token.startsWith(process.env.BEARER_TOKEN)){
         return next(new AppError("Token Not Exist, Unauthorized!" , 401)) ;
      }
      const bearerToken = token.split(' ')[1] ;


      //& 2- verify Token
      let decoded = jwt.verify(bearerToken , process.env.SECRET_KEY) ;
      if(!decoded) return next(new AppError("Token Not Valid" , 498)) ;

      
      //& 3- Check Exist User Or Not
      const user = await userModel.findById(decoded._id).select("-password") ;
      if(!user) return next(new AppError("User Not Exist ProtectedRoute" , 401)) ;

      if(user.passwordChangedAt){
         //& 4- Change Password And Token Expired
         let time = parseInt(user?.passwordChangedAt / 1000) ;
         // console.log(time , "|" , decoded.iat);
         if(time > decoded.iat) return next(new AppError("Token Not Valid..Login again" , 401)) ;
      }

      req.user = user
      next();
   }
)
