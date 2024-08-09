import { Router } from "express";
import * as reportControl from "./report.controller.js";
import { validation } from "../../middleWare/validation.js";
import { getOrderByPatientNameVal, getReportVal } from "./report.validate.js";
import { authorize } from "../../middleWare/authorization.js";
import { protectedRoutes } from "../../middleWare/authentication.js";









const router = Router() ;

   router.route("/")
   // .get( validation(getReportVal) ,  reportControl.getAllOrdersReports)
   .get(protectedRoutes , authorize("admin" , "moderator") ,   validation(getReportVal) ,  reportControl.getAllOrdersReports)

   router.route("/orderPatient")
   // .get( validation(getOrderByPatientNameVal) ,  reportControl.getOrderByPatientName)
   .get(protectedRoutes , authorize("admin" , "moderator") ,  validation(getOrderByPatientNameVal) ,  reportControl.getOrderByPatientName)


export default router ;