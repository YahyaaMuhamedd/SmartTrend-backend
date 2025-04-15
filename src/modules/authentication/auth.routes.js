import { Router } from "express";
import * as AuthControl from "./auth.controller.js";
import { emailExist } from "../../middleWare/emailExist.js";
import {signUpVal ,  signInVal , changePasswordVal , sendCodeToEmailVal , resetPasswordVal, verifyOTPVal, verifyOTPConfirmedEmailVal} from "../authentication/auth.validate.js";

import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { validation } from "../../middleWare/validation.js";
import { ROLES } from "../../utilities/enums.js";



const router  = Router() ; 
//^=========================== Sign Up =============================================
	router.route("/signUp")
		.post (validation(signUpVal) ,  emailExist  , AuthControl.signUp) 




//^=========================== Sign In =============================================
	router.route("/signIn")
		.post(validation(signInVal)  , AuthControl.signIn) 




		
		
		
	//^=========================== Change Password =====================================
	router.route("/changePassword")
		.patch(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(changePasswordVal) , AuthControl.changePassword) 
		
		
		
//^=========================== Confirmed Email =====================================

	//^ 1- First request to send OTP :
	router.route("/send-otp")
		.post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER)  ,  AuthControl.sendCodeToEmailActivation) 
	//^ 1- Verify OTP and confirmed account :
	router.route("/confirm")
		.post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(verifyOTPConfirmedEmailVal)   , AuthControl.confirmedEmail) 
	




//^=========================== All Steps Forget Password =========================== 
router.route("/request-reset")
//^ 1- Send Code BY Email :
	.post(validation(sendCodeToEmailVal)  , AuthControl.sendCodeToEmail) 
//^ 2- Send Code BY Email :
router.route("/verify-otp")
	.post(validation(verifyOTPVal) , AuthControl.verifyOTP) 
router.route("/reset-password")
//^ 3- Reset Password :
	.post(validation(resetPasswordVal)   , AuthControl.resetPassword) 









//^=========================== Generate QR Code =====================================
	router.route("/qr_code")
		.get (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , AuthControl.generateQR_Code) 


export default router ;