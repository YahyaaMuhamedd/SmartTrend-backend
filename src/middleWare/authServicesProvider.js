import { branchModel } from "../../DataBase/models/branch.model.js";
import { companyModel } from "../../DataBase/models/company.model.js";
import { AppError } from "../utilities/AppError.js";
import { catchError } from "../utilities/catchError.js";
import jwt from "jsonwebtoken";



//& Authentication :
export const authServicesProvider = catchError(
   async (req , res , next)=>{
      const{token} = req.headers ;

      // 1- Check Token Exist And Bearer Token :
      if (!token || !token.startsWith(process.env.BEARER_TOKEN)){
         return next(new AppError("Token Not Exist, Unauthorized!" , 401)) ;
      }
      const bearerToken = token.split(' ')[1] ;

      // 2- verify Token
      let decoded = jwt.verify(bearerToken , process.env.SECRET_KEY) ;
      if(!decoded) return next(new AppError("Token Not Valid" , 401)) ;

      // 3- Check Exist company Or Not
      const branch = await branchModel.findById(decoded._id) ;
      if(!branch) return next(new AppError("Branch Not Exist ProtectedRoute" , 401)) ;
      if(!branch.isActive) return next(new AppError("Branch is blocked" , 401)) ;

      
      req.branch = branch
      next();
   }
)

