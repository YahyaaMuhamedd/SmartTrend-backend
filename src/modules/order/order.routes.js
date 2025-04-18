import { Router } from "express";
import * as orderControl from "./order.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { createCashOrderVal , invoiceVodafoneVal , paramsIdVal } from "./order.validate.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { ROLES } from "../../utilities/enums.js";




const router = Router() ;





//^=============================== Get All Order ====================================================
   router.route("/")
   .get( orderControl.getAllOrder)
   // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  orderControl.getAllOrder)
   




   //^============================ Get Order Count ==================================================
   router.route("/orderCount")
   .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) ,  orderControl.getOrderCount)






   //^=========================== Get Logged User Order =============================================
   router.route("/LoggedUserOrder")
      .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  orderControl.getLoggedUserOrder)









   //^============== Add Invoice V_Cash - Confirm order - GetOrder - DeleteOrder ====================   
   router.route("/:id")
      .put(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         multerLocal(validExtension.image , "Invoice.V_Cash").single("image") , 
         validation(invoiceVodafoneVal) ,  
         orderControl.invoice_VodafoneCash) 



      .patch(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR)  , 
         validation(paramsIdVal)   ,  
         orderControl.confirmCashOrder) 




      .get(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         validation(paramsIdVal) , 
         orderControl.getSpecificOrder)



      .delete(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR)  ,  
         validation(paramsIdVal) , 
         orderControl.deleteOrder) 






   //^================================== Cancel Cash Order ==========================================
   router.route("/cancel/:id")
      .patch(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR)  ,  validation(paramsIdVal) , orderControl.cancelCashOrder) 
   
   




   //^================================== Rejected Cash Order ========================================
   router.route("/rejected/:id")
      .patch(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR)   ,  validation(paramsIdVal) , orderControl.rejectedCashOrder) 
   




   //^================================== Update Order ===============================================
   router.route("/updateOrder/:id")
      .patch(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , orderControl.updateOrder) 
      // .patch(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR)  ,  validation(paramsIdVal) , orderControl.updateOrder) 
   





   //^================================== Check Exist Patient ========================================
   router.route("/orderLoggedUser")
      .post(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         validation(createCashOrderVal) , 
         orderControl.checkExistPatient , 
         orderControl.createCashOrderLoggedUser
      )






   //^================================== Generate Invoice Order =====================================
   router.route("/generateInvoiceOrder/:id")
   .post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) , orderControl.generateInvoiceOrder)
   
   










   
//^================================== Create Online Order And Payment With Paymob =====================================
// & Create Payment Method :

router.route("/create-payment")
.post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(createCashOrderVal) , orderControl.checkExistPatient , orderControl.createSession )





export default router ;