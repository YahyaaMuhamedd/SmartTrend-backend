import { companyModel } from "../../DataBase/models/company.model.js";
import { AppError } from "../utilities/AppError.js";
import { catchError } from "../utilities/catchError.js";
import jwt from "jsonwebtoken";



//& Authentication :
export const authenticateCompany = catchError(
   async (req , res , next)=>{
      const{token} = req.headers ;

      // 1- Check Token Exist Or Not
      if(!token) return next(new AppError("Token Not Exist" , 401)) ;

      // 2- verify Token
      let decoded = jwt.verify(token , process.env.SECRET_KEY) ;
      if(!decoded) return next(new AppError("Token Not Valid" , 401)) ;
      console.log(decoded);

      // 3- Check Exist company Or Not
      const company = await companyModel.findById(decoded._id) ;
      if(!company) return next(new AppError("Company Not Exist ProtectedRoute" , 401)) ;

      if(company.passwordChangedAt){
         // 4- Change Password And Token Expired
         let time = parseInt(company?.passwordChangedAt.getTime() / 1000) ;
         // console.log(time , "|" , decoded.iat);
         if(time > decoded.iat) return next(new AppError("Token Not Valid..Login again" , 401)) ;
      }

      req.company = company
      next();
   }
)

