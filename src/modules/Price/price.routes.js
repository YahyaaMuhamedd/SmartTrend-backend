import { Router } from "express";
import * as priceControl from "./price.controller.js";
import {validation} from "../../middleWare/validation.js";
import { addPriceVal, paramsIdVal, updatePriceVal } from "./price.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";




const router = Router() ;

   //^=========================== Get All Prices =============================================
   router.route("/")
      .get( priceControl.getAllPrice)
      // .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR) , priceControl.getAllPrice)
      .post(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(addPriceVal) , priceControl.addPrice)
      
      

   //^=========================== Deleted All Prices In Database ==============================
   router.route("/deleted_all_prices_in_database")
      .delete( priceControl.deletedAllPrices)





   //^=========================== Get Prices Specific Company =================================
   router.route("/getPriceCompany/:id")
      .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) , priceControl.getPriceCompany)





   //^=========================== Get Specific Price And Update, Delete Price =================
   router.route("/:id")
      .get(validation(paramsIdVal) ,  priceControl.getSinglePrice)
      // .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(paramsIdVal) ,  priceControl.getSinglePrice)

      .put(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(updatePriceVal) , priceControl.updatePrice)

      .delete(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal)  , priceControl.deletePrice)


export default router ;