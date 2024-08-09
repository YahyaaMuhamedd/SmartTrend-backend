import { Router } from "express";
import * as cartControl from "./cart.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { addCartVal, paramsIdVal } from "./cart.validate.js";




const router = Router() ;

router.route("/")
      .get(protectedRoutes , authorize("admin" , "moderator" ) , cartControl.getAllCart)
      .post(protectedRoutes , authorize("admin" , "moderator" , "user"), validation(addCartVal) , cartControl.addTestToCart)
      .delete(protectedRoutes , authorize("admin" , "moderator" , "user"), cartControl.clearLoggedUserCart)


router.route("/:id")
      .delete(protectedRoutes , authorize("admin" , "moderator" , "user"), validation(paramsIdVal)  ,cartControl.removeTestFromCart)

router.route("/userCart")
      .get(protectedRoutes , authorize("admin" , "moderator" , "user") , cartControl.getLoggedUserCart)

export default router ;