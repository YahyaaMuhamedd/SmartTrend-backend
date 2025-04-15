import { Router } from "express";
import * as UC from "./user.controller.js";
import { emailExist } from "../../middleWare/emailExist.js";
import { validation } from "../../middleWare/validation.js";
import { addUserVal, blockedAndActiveUserVal , paramsIdVal, singleVal, updateUserRoleVal, updateUserVal } from "./user.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { ROLES } from "../../utilities/enums.js";



const router  = Router() ; 


//^=========================== Get Users, Add User, Change Image ==============================================
router.route("/")
		// .get(UC.getAllUser)
		.get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , UC.getAllUser)

		.post (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(addUserVal) ,  emailExist ,  UC.addUser) 
		.patch (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,multerLocal(validExtension.image , "users").single("file") ,  validation(singleVal) ,  UC.changeImgCover) 
		.put (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER ) ,  validation(updateUserVal) , UC.updateUser) 


		
//^=========================== Get Information Users To Dashboard =============================================
	router.route("/userCount")
		// .get(UC.getUserCount)
		.get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , UC.getUserCount)




//^=========================== Deleted All Users In Database ==================================================
	router.route("/deleted_all_users_in_database")
		.delete( UC.deletedAllUsers)






//^=========================== Get User, Update, Block, Delete User ===========================================
	router.route("/:id")
		.get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER ) , validation(paramsIdVal) , UC.getSingleUser)
		.delete (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) ,  validation(paramsIdVal) , UC.deleteUser) 
		.patch (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) ,  validation(blockedAndActiveUserVal) , UC.blockUser) 





//^=========================== Update User Role ===============================================================
	router.route("/role/:id")
		.patch (protectedRoutes , authorize(ROLES.ADMIN) ,  validation(updateUserRoleVal) , UC.updateUserRole) 


export default router ;


