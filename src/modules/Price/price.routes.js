import { Router } from "express";
import * as priceControl from "./price.controller.js";
import {validation} from "../../middleWare/validation.js";
import { addPriceVal, paramsIdVal, updatePriceVal } from "./price.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";




const router = Router() ;

router.route("/")
   // .get( priceControl.getAllPrice)
   .get(protectedRoutes , authorize("admin" , "moderator") , priceControl.getAllPrice)
   .post(protectedRoutes , authorize("admin" , "moderator") , validation(addPriceVal) , priceControl.addPrice)
   
   
   
   router.route("/getPriceCompany/:id")
   .get(protectedRoutes , authorize("admin" , "moderator" , "user") , validation(paramsIdVal) , priceControl.getPriceCompany)



router.route("/:id")
   // .get(validation(paramsIdVal) ,  priceControl.getSinglePrice)
   .get(protectedRoutes , authorize("admin" , "moderator")  , validation(paramsIdVal) ,  priceControl.getSinglePrice)

   .put(protectedRoutes , authorize("admin" , "moderator") , validation(updatePriceVal) , priceControl.updatePrice)

   .delete(protectedRoutes , authorize("admin" , "moderator") , validation(paramsIdVal)  , priceControl.deletePrice)






export default router ;