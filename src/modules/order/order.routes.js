import { Router } from "express";
import * as orderControl from "./order.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { addHouseCallVal , cancelOrderVal , createCashOrderAdminVal , createOnlineOrderVal, createOrderVal , generateInvoiceOrderVal , paidOrderVal, paramsIdVal } from "./order.validate.js";
import { ROLES } from "../../utilities/enums.js";




const router = Router() ;


//^=============================== Get All Order ====================================================
   router.route("/")
   .get( orderControl.getAllOrder)
   // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  orderControl.getAllOrder)
   




   
   //^=============================== Sales Last Month ===============================================
      router.route("/salesLastMonth")
      .get( orderControl.salesLastMonth)
      




   //^============================ Get Order Count Admin Dashboard ===================================
   router.route("/orderCount")
   .get(orderControl.getOrderCount)
   // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) ,  orderControl.getOrderCount)






   //^=========================== Get Logged User Order =============================================
   router.route("/getLoggedUserOrder")
      .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  orderControl.getLoggedUserOrder)





   //^================================== Create Online Order And Payment With Paymob =====================================
   // & Create Payment Method :
   router.route("/create-session")
      .post(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         validation(createOnlineOrderVal) , 
         orderControl.checkExistPatientMiddleWare , 
         orderControl.createSession )





         
   //^================================== Create Cash Order ========================================
   router.route("/createCashOrder")
      .post(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         validation(createOrderVal) , 
         orderControl.checkExistPatientMiddleWare , 
         orderControl.createCashOrder
      )




         
   //^================================== Create Cash Order By Admin ========================================
   router.route("/createCashOrderByAdmin")
      .post(protectedRoutes , 
         authorize(ROLES.ADMIN) , 
         validation(createCashOrderAdminVal) , 
         orderControl.checkExistPatientMiddleWare , 
         orderControl.createCashOrderByAdmin
      )
         
   //^================================== Create Cash Order By InstaPay ========================================
   router.route("/createCashOrderByInstaPay")
      .post(protectedRoutes , 
         authorize(ROLES.USER) , 
         validation(createCashOrderAdminVal) , 
         orderControl.checkExistPatientMiddleWare , 
         orderControl.createCashOrderByInstaPay
      )
   //^==================================  Approved Order By InstaPay ========================================
   router.route("/paidOrder")
      .patch(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR) , 
         validation(paidOrderVal) , 
         orderControl.paidOrderByAdmin
      )




   //^============== Add House Call order - Cancel order - GetOrder - DeleteOrder ====================   
   router.route("/:id")
      .get(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         validation(paramsIdVal) , 
         orderControl.getSpecificOrder)


      .patch(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR) ,  
         validation(addHouseCallVal) ,  
         orderControl.addHouseCall) 
         

      .put(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR)  ,  
         validation(cancelOrderVal) , 
         orderControl.cancelOrder) 

         
      .delete(protectedRoutes , 
         authorize(ROLES.ADMIN , ROLES.MODERATOR)  ,  
         validation(paramsIdVal) , 
         orderControl.deleteOrder) 





   //^================================== Delete Order Media =====================================
   router.route("/media/:id")
   .delete(protectedRoutes , 
      authorize(ROLES.ADMIN , ROLES.MODERATOR) , 
      validation(paramsIdVal) , 
      orderControl.deleteOrderMedia)
   
   




   //^================================== Generate Invoice Order =====================================
   router.route("/generateInvoiceOrder")
   .post(protectedRoutes , 
      authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
      validation(generateInvoiceOrderVal) , 
      orderControl.generateInvoiceOrder)
   
   
export default router ;