import { Router } from "express";
import * as onlineSystemControl from "../onlineSystem/onlineSystem.controller.js";
import {validation} from "../../middleWare/validation.js";
import { approvalVal, invoiceInfoVal, signInVal } from "./onlineSystem.validate.js";
import { authServicesProvider } from "../../middleWare/authServicesProvider.js";





const router = Router() ;
//^=========================== Get Approved Order Information =====================================
   router.route("/")
      .get(authServicesProvider  , validation(invoiceInfoVal) , onlineSystemControl.getApprovedOrderInfo) 
      .post(validation(signInVal) , onlineSystemControl.signInBranch) 




//^=========================== Transform Online System =====================================
   router.route("/approval")
      .post(authServicesProvider  , validation(approvalVal) , onlineSystemControl.transformOnlineSystem) 

export default router ;
