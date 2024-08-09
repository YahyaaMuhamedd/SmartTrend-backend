import { Router } from "express";
import * as UC from "./user.controller.js";
import { emailExist } from "../../middleWare/emailExist.js";
import { validation } from "../../middleWare/validation.js";
import { addUserVal, blockedAndActiveUserVal , paramsIdVal, singleVal, updateUserRoleVal, updateUserVal } from "./user.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";



const router  = Router() ; 



router.route("/")
      // .get(UC.getAllUser)
      .get(protectedRoutes , authorize("admin" , "moderator") ,UC.getAllUser)
      .post (protectedRoutes , authorize("admin" , "moderator") , validation(addUserVal) ,  emailExist ,  UC.addUser) 
      .patch (protectedRoutes , authorize("admin" , "moderator" , "user") , multerLocal(validExtension.image , "users").single("image") ,  validation(singleVal) ,  UC.changeImgCover) 
      
      
      
router.route("/userCount")
      // .get(UC.getUserCount)
      .get(protectedRoutes , authorize("admin" , "moderator") , UC.getUserCount)

router.route("/:id")
      .get(protectedRoutes , authorize("admin" , "moderator" , "user") , validation(paramsIdVal) , UC.getSingleUser)
      .put (protectedRoutes , authorize("admin" , "moderator" , "user") ,  validation(updateUserVal) , UC.updateUser) 
      .delete (protectedRoutes , authorize("admin" , "moderator") ,  validation(paramsIdVal) , UC.deleteUser) 
      .patch (protectedRoutes , authorize("admin" , "moderator") ,  validation(blockedAndActiveUserVal) , UC.blockUser) 



router.route("/role/:id")
      .patch (protectedRoutes , authorize("admin" , "moderator") ,  validation(updateUserRoleVal) , UC.updateUserRole) 



export default router ;


