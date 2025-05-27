import { Router } from "express";
import * as profileControl from "./profile.controller.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";
import { addProfileVal , paramsIdVal } from "./profile.validate.js";




const router = Router() ;
//^=========================== Get All Companies, Add Company ==================================
   router.route("/")
      .get( profileControl.getAllProfiles)
      // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , profileControl.getAllProfiles)

      .post(protectedRoutes ,  
         authorize(ROLES.ADMIN , ROLES.MODERATOR) , 
         multerLocal(validExtension.image , "Profile").single("file"), 
         validation(addProfileVal) ,
         profileControl.addProfile)


//^=========================== Get Single Profile, Update, Delete, Create Order Profile =================
   router.route("/:id")
      .get(protectedRoutes ,  
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         validation(paramsIdVal)  , 
         profileControl.getSingleProfile)

      .post(protectedRoutes ,  
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         validation(paramsIdVal) ,
         profileControl.createProfileOrder)

      .patch(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR) , 
         validation(paramsIdVal)  , 
         profileControl.activeProfile)
      

      .delete(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR) , 
         validation(paramsIdVal)  , 
         profileControl.deleteProfile) ;





export default router ;