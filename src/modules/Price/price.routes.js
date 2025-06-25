import { Router } from "express";
import * as priceControl from "./price.controller.js";
import {validation} from "../../middleWare/validation.js";
import { addRadiologyPriceVal, addTestPriceVal, paramsIdVal, updateTestPriceByIdVal, updateTestPriceVal } from "./price.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";




const router = Router() ;

      //^=========================== Get All Prices =============================================
      router.route("/")
         .get( priceControl.getAllPrice)
         // .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR) , priceControl.getAllPrice)
         .post(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(addTestPriceVal) , priceControl.addTestPrice)
         .put(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(updateTestPriceVal) , priceControl.updatePrice)
         
         
         //^=========================== Add Tests By Excel Sheet  ==============================
         router.route("/addRadiologyPrice")
         .post(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(addRadiologyPriceVal) , priceControl.addRadiologyPrice)
      
      
         
      //^=========================== Add Tests By Excel Sheet  ==============================
      router.route("/addAllTestPriceByExcelSheet")
         .post(protectedRoutes , authorize(ROLES.ADMIN) , multerLocal(validExtension.excel , "excel").single("file") , priceControl.addTestPriceSheetExcelToDatabase)
      
      
         
      //^=========================== Add Radiology By Excel Sheet  ==============================
      router.route("/addAllRadiologyPriceByExcelSheet")
         .post(protectedRoutes , authorize(ROLES.ADMIN) , multerLocal(validExtension.excel , "excel").single("file") , priceControl.addRadiologyPriceSheetExcelToDatabase)
      
      
      
      
      
      
      //^=========================== Get Prices Specific Company =================================
      router.route("/getPriceCompany/:id")
      .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) , priceControl.getPriceCompany)
      
      
      
      
      
      //^=========================== Get Specific Price And Update, Delete Price =================
      router.route("/:id")
      .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) ,  priceControl.getSinglePrice)
      .put(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(updateTestPriceByIdVal) , priceControl.updatePriceById)


      .delete(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal)  , priceControl.deletePrice)


export default router ;