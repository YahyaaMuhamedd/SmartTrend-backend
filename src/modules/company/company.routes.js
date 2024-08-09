import { Router } from "express";
import * as companyControl from "./company.controller.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import {validation} from "../../middleWare/validation.js";
import { addCompanyVal  , changeCoverVal, paramsIdVal , updateCompanyVal } from "./company.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";




const router = Router() ;

router.route("/")
   // .get( companyControl.getAllCompanies)
   .get(protectedRoutes , authorize("admin" , "moderator" , "user") , companyControl.getAllCompanies)
   .post(protectedRoutes , authorize("admin" , "moderator" ) , multerLocal(validExtension.image , "company").single("file"), validation(addCompanyVal) ,companyControl.addCompany)
   
router.route("/getCompanyCount")
   // .get( companyControl.getCompanyCount)
   .get(protectedRoutes , authorize("admin" , "moderator") , companyControl.getCompanyCount)

   
   
   router.route("/:id")
   // .get( validation(paramsIdVal)  , companyControl.getSingleCompany)
   .get(protectedRoutes , authorize("admin" , "moderator" ) , validation(paramsIdVal)  , companyControl.getSingleCompany)


   // .put(validation(updateCompanyVal) ,  companyControl.updateCompany)
   .put(protectedRoutes , authorize("admin" , "moderator") , validation(updateCompanyVal) ,  companyControl.updateCompany)
   
   // .patch(multerLocal(validExtension.image , "company").single("image") , validation(changeCoverVal) ,  companyControl.changeImgCover) 
   .patch(protectedRoutes , authorize("admin" , "moderator") ,  multerLocal(validExtension.image , "company").single("image") ,  validation(changeCoverVal) ,companyControl.changeImgCover) 

   // .delete( validation(paramsIdVal)  , companyControl.deleteCompany)
   .delete(protectedRoutes , authorize("admin" , "moderator") , validation(paramsIdVal)  , companyControl.deleteCompany)
   

export default router ;