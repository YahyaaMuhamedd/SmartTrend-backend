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
      router.route("/addAllTestPriceByExcelSheet")
         .post(protectedRoutes , authorize(ROLES.ADMIN) , multerLocal(validExtension.excel , "excel").single("file") , priceControl.addTestPriceSheetExcelToDatabase)



      //^=========================== Bulk Update Tests and Prices with Conditions ===============
      router.route("/bulkUpdateTestsAndPrices")
         .post(protectedRoutes , authorize(ROLES.ADMIN) , multerLocal(validExtension.excel , "excel").fields([
            { name: 'testPriceFile', maxCount: 1 },
            { name: 'testConditionsFile', maxCount: 1 },
            { name: 'radiologyPriceFile', maxCount: 1 },
            { name: 'radiologyConditionsFile', maxCount: 1 }
         ]) , priceControl.bulkUpdateTestsAndPrices)



      //^=========================== Add Tests Only (No Prices) from Excel =====================
      router.route("/addTestsOnlyFromExcel")
         .post(protectedRoutes , authorize(ROLES.ADMIN) , multerLocal(validExtension.excel , "excel").fields([
            { name: 'testPriceFile', maxCount: 1 },
            { name: 'testConditionsFile', maxCount: 1 },
            { name: 'radiologyPriceFile', maxCount: 1 },
            { name: 'radiologyConditionsFile', maxCount: 1 }
         ]) , priceControl.addTestsOnlyFromExcel)



      //^=========================== Add ONLY Missing Tests with Prices =======================
      router.route("/addMissingTestsWithPrices")
         .post(protectedRoutes , authorize(ROLES.ADMIN) , multerLocal(validExtension.excel , "excel").fields([
            { name: 'testPriceFile', maxCount: 1 },
            { name: 'testConditionsFile', maxCount: 1 },
            { name: 'radiologyPriceFile', maxCount: 1 },
            { name: 'radiologyConditionsFile', maxCount: 1 }
         ]) , priceControl.addMissingTestsWithPrices)



      //^=========================== Remove Tests NOT in Excel (Cleanup) =======================
      router.route("/removeTestsNotInExcel")
         .delete(protectedRoutes , authorize(ROLES.ADMIN) , multerLocal(validExtension.excel , "excel").fields([
            { name: 'testPriceFile', maxCount: 1 },
            { name: 'testConditionsFile', maxCount: 1 },
            { name: 'radiologyPriceFile', maxCount: 1 },
            { name: 'radiologyConditionsFile', maxCount: 1 }
         ]) , priceControl.removeTestsNotInExcel)



      //^=========================== Get Prices Specific Company =================================
      router.route("/getPriceCompany/:id")
      .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) , priceControl.getPriceCompany)
      
      
      
      
      
      //^=========================== Get Specific Price And Update, Delete Price =================
      router.route("/:id")
      .get(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) ,  priceControl.getSinglePrice)
      .put(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(updateTestPriceByIdVal) , priceControl.updatePriceById)


      .delete(protectedRoutes  , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal)  , priceControl.deletePrice)


export default router ;