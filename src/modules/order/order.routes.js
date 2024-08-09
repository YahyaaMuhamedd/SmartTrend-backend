import { Router } from "express";
import * as orderControl from "./order.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { createCashOrderVal, invoiceVodafoneVal, onlineSystemVal, paramsIdVal } from "./order.validate.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { authenticateCompany } from "../../middleWare/authCompany.js";




const router = Router() ;


//^=============================== Get All Order ====================================================
   router.route("/")
      // .get( orderControl.getAllOrder)
   .get(protectedRoutes , authorize("admin" , "moderator") ,  orderControl.getAllOrder)
   




   //^============================ Get Order Count ==================================================
   router.route("/orderCount")
      // .get( orderControl.getOrderCount)
   .get(protectedRoutes , authorize("admin" , "moderator") ,  orderControl.getOrderCount)





   //^============================ Get Cancel Orders ================================================
   router.route("/cancel")
      // .get( orderControl.getCancelOrders)
   .get(protectedRoutes , authorize("admin" , "moderator") ,  orderControl.getCancelOrders)





   //^=========================== Get Logged User Order =============================================
   router.route("/LoggedUserOrder")
      .get(protectedRoutes , authorize("admin" , "moderator" , "user") , orderControl.getLoggedUserOrder)




   //^ =========================== Online System ====================================================
   router.route("/transform_Online_System")
      .get(authenticateCompany  , validation(onlineSystemVal)  ,  orderControl.getApprovedOrder) 
      .post(authenticateCompany  , validation(onlineSystemVal)  ,  orderControl.transformOnlineSystem) 




   //^============== Add Invoice V_Cash - Confirm order - GetOrder - DeleteOrder ====================   
   router.route("/:id")
      .put(protectedRoutes , 
         authorize("admin" , "moderator" , "user") , 
         multerLocal(validExtension.image , "Invoice.V_Cash").single("image") , 
         validation(invoiceVodafoneVal) ,  
         orderControl.invoice_VodafoneCash) 

      .patch(protectedRoutes , authorize("admin" , "moderator")  , validation(paramsIdVal)   ,  orderControl.confirmCashOrder) 

      // .get( orderControl.getSpecificOrder)

      .get(protectedRoutes , authorize("admin" , "moderator" , "user") , validation(paramsIdVal) , orderControl.getSpecificOrder)

      .delete(protectedRoutes , authorize("admin" , "moderator")  ,  validation(paramsIdVal) , orderControl.deleteOrder) 






   //^================================== Cancel Cash Order ==========================================
   router.route("/cancel/:id")
      .patch(protectedRoutes , authorize("admin" , "moderator")  ,  validation(paramsIdVal) , orderControl.cancelCashOrder) 
   
   




   //^================================== Rejected Cash Order ========================================
   router.route("/rejected/:id")
      .patch(protectedRoutes , authorize("admin" , "moderator")  ,  validation(paramsIdVal) , orderControl.rejectedCashOrder) 
   




   //^================================== Update Order ===============================================
   router.route("/updateOrder/:id")
      .patch(protectedRoutes , authorize("admin" , "moderator")  ,  validation(paramsIdVal) , orderControl.updateOrder) 
   





   //^================================== Check Exist Patient ========================================
   router.route("/orderLoggedUser")
      .post(protectedRoutes , authorize("user" , "admin" , "moderator") , validation(createCashOrderVal) , orderControl.checkExistPatient , orderControl.createCashOrderLoggedUser)






   //^================================== Generate Invoice Order =====================================
   router.route("/generateInvoiceOrder/:id")
      .post(protectedRoutes , authorize("user" , "admin" , "moderator") , validation(createCashOrderVal) , orderControl.generateInvoiceOrder)


export default router ;