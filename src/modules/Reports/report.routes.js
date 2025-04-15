import { Router } from "express";
import * as reportControl from "./report.controller.js";
import { validation } from "../../middleWare/validation.js";
import { getOrderByPatientNameVal, getReportNewVal, getReportVal } from "./report.validate.js";
import { authorize } from "../../middleWare/authorization.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { ROLES } from "../../utilities/enums.js";







const router = Router() ;


//^=========================== Get All Orders Reports, Get All Orders Filter New Dashboard =====================================
   router.route("/")
      .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,   validation(getReportVal) ,  reportControl.getAllOrdersReports)
      // .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER)  ,  reportControl.getAllOrdersReports)
      .post(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER)  , validation(getReportNewVal) , reportControl.getAllOrdersFilterNew)



//^=========================== Get Order By Patient Name =====================================
   router.route("/orderPatient")
   // .get( validation(getOrderByPatientNameVal) ,  reportControl.getOrderByPatientName)
   .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  validation(getOrderByPatientNameVal) ,  reportControl.getOrderByPatientName)


export default router ;