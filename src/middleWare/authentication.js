import { userModel } from "../../DataBase/models/user.model.js";
import { AppError } from "../utilities/AppError.js";
import { catchError } from "../utilities/catchError.js";
import jwt from "jsonwebtoken";



//& Authentication :
export const protectedRoutes = catchError(
   async (req , res , next)=>{
      const{token} = req.headers ;

      // 1- Check Token Exist Or Not
      if(!token) return next(new AppError("Token Not Exist" , 401)) ;

      // 2- verify Token
      let decoded = jwt.verify(token , process.env.SECRET_KEY) ;
      if(!decoded) return next(new AppError("Token Not Valid" , 401)) ;

      // 3- Check Exist User Or Not
      const user = await userModel.findById(decoded._id) ;
      if(!user) return next(new AppError("User Not Exist ProtectedRoute" , 401)) ;

      if(user.passwordChangedAt){
         // 4- Change Password And Token Expired
         let time = parseInt(user?.passwordChangedAt.getTime() / 1000) ;
         // console.log(time , "|" , decoded.iat);
         if(time > decoded.iat) return next(new AppError("Token Not Valid..Login again" , 401)) ;
      }

      req.user = user
      next();
   }
)

