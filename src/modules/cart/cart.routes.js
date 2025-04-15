import { Router } from "express";
import * as cartControl from "./cart.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { addAllTestsToCartVal, addCartVal, paramsIdVal } from "./cart.validate.js";
import { ROLES } from "../../utilities/enums.js";




const router = Router() ;
//^=========================== Get Carts, Add Test, Clear Cart =========================
	router.route("/")
		.get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , cartControl.getAllCart)
		.post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER), validation(addCartVal) , cartControl.addTestToCart)
		.delete(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER), cartControl.clearLoggedUserCart)






//^=========================== Add All Tests To Cart =====================================
	router.route("/addAllTest")
		.post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(addAllTestsToCartVal) , cartControl.addAllTestsToCart)







//^=========================== Remove Test From Cart =====================================
	router.route("/:id")
		.delete(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER), validation(paramsIdVal)  ,cartControl.removeTestFromCart)






//^=========================== Get Logged User Cart =======================================
	router.route("/userCart")
		.get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , cartControl.getLoggedUserCart)

export default router ;