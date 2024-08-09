import { Router } from "express";
import * as AuthControl from "./auth.controller.js";
import { emailExist } from "../../middleWare/emailExist.js";
import {signUpVal ,  signInVal , changePasswordVal, sendCodeVal} from "../authentication/auth.validate.js";

import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { validation } from "../../middleWare/validation.js";



const router  = Router() ; 

      router.route("/signUp")
            .post (validation(signUpVal) ,  emailExist  , AuthControl.signUp) 
            
            
      router.route("/signIn")
      .post(validation(signInVal)  , AuthControl.signIn) 
      
      
      router.route("/signInCompany")
      .post(validation(signInVal)  , AuthControl.signInBranch) 
      
      
      router.route("/confirm")
      .post(protectedRoutes , authorize("admin" , "moderator" , "user") , AuthControl.sendCode) 
      .patch(protectedRoutes , authorize("admin" , "moderator" , "user") , validation(sendCodeVal)   , AuthControl.confirmedEmail) 
      
      
      router.route("/changePassword")
      .patch(protectedRoutes , authorize("admin" , "moderator" , "user") , validation(changePasswordVal) , AuthControl.changePassword) 
      
      router.route("/qr_code")
            .get (protectedRoutes , authorize("admin" , "moderator" , "user") , AuthControl.generateQR_Code) 
export default router ;