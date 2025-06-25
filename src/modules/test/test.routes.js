import { Router } from "express";
import * as testControl from "./test.controller.js";
import {validation} from "../../middleWare/validation.js";
import { addTestOnlyVal, addTestVal, paramsIdVal, updateTestVal } from "./test.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";




const router = Router() ;


//^=========================== Get All Test, Add Test ============================================
router.route("/")
   .get( testControl.getAllTest)
   // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , testControl.getAllTest)
   //& Add Test And Price in Same EndPoint :
   .post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  validation(addTestVal) ,  testControl.addTest)
   

//^===========================Add Test With Price============================================
router.route("/addTestWithPrice")
   //& Add Test And Price in Same EndPoint :
   .post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  validation(addTestVal) ,  testControl.addTest)
   






//^=========================== Get Test Count Dashboard ==========================================
router.route("/getTestCount")
   // .get( testControl.getTestCount)
   .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , testControl.getTestCount)




//^=========================== Add Test And Price in Same EndPoint  ==============================
router.route("/addTestOnly")
      .post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  validation(addTestOnlyVal)  , testControl.addTestOnly)



//^=========================== Add Tests By Excel Sheet  ==============================
router.route("/addAllTestByExcelSheet")
      .post(protectedRoutes , authorize(ROLES.ADMIN) ,  multerLocal(validExtension.excel , "excel").single("file") , testControl.addTestSheetExcelToDatabase)


//^=========================== Add Tests By Excel Sheet  ==============================
router.route("/getListTestByExcelSheet")
      .get(testControl.generateExcelListTest)



//^=========================== Deleted All Tests In Database =====================================
router.route("/deleted_all_tests_in_database")
      .delete( testControl.deletedAllTests)


      



//^=========================== Get Single Test ===================================================
router.route("/:id")
   .get(testControl.getSingleTest)
   // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) , testControl.getSingleTest)



   // .put(validation(updateTestVal)  ,  testControl.updateTest)
   .put(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR ) , validation(updateTestVal)  ,  testControl.updateTest)



   // .delete(validation(paramsIdVal)  , testControl.deleteTest)
   .delete(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(paramsIdVal)  , testControl.deleteTest)

export default router ;