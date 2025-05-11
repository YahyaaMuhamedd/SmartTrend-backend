import { Router } from "express";
import * as reportControl from "./report.controller.js";
import { validation } from "../../middleWare/validation.js";
import { getReportVal } from "./report.validate.js";
import { authorize } from "../../middleWare/authorization.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { ROLES } from "../../utilities/enums.js";







const router = Router() ;


//^=========================== Get All Orders Reports, Get All Orders Filter New Dashboard =====================================
   router.route("/")
      .post(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER)  , validation(getReportVal) , reportControl.getReportOrders)

export default router ;