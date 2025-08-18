import { Router } from "express";
import * as offerControl from "./offerPrices.controller.js";
import {priceListIdVal } from "./offerPrices.validate.js";
import { validation } from "../../middleWare/validation.js";
import { authorize } from "../../middleWare/authorization.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { ROLES } from "../../utilities/enums.js";





const router = Router() ;


//^=========================== Get Offers =====================================
   router.route("/prices")
      .post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(priceListIdVal) , offerControl.getOffers)

export default router ;

