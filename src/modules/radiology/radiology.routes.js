import { Router } from "express";
import * as radiologyControl from "./radiology.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { addRadiologyVal, paramsIdVal, updateRadiologyVal } from "./radiology.validate.js";




const router = Router() ;


//^=========================== Get All Radiology, Add Radiology ============================================
router.route("/")
   .get( radiologyControl.getAllRadiology)
   // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , radiologyControl.getAllRadiology)

   .post(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  validation(addRadiologyVal) ,  radiologyControl.addRadiology)
   

//^=========================== Get Radiology Count Dashboard ==========================================
router.route("/getRadiologyCount")
   // .get( radiologyControl.getTestCount)
   .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , radiologyControl.getRadiologyCount)




//^=========================== Add Radiology By Excel Sheet  ==============================
router.route("/addAllRadiologyByExcelSheet")
   .post(protectedRoutes , authorize(ROLES.ADMIN) ,  multerLocal(validExtension.excel , "excel").single("file") , radiologyControl.addRadiologySheetExcelToDatabase)


//^=========================== Add Radiology By Excel Sheet  ==============================
router.route("/getListRadiologyByExcelSheet")
   .get(radiologyControl.generateExcelListRadiology)





//^=========================== Get Single Radiology ===================================================
router.route("/:id")
      .get(radiologyControl.getSingleRadiology)
      // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) , radiologyControl.getSingleTest)



      // .put(validation(updateTestVal)  ,  radiologyControl.updateTest)
      .put(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR ) , validation(updateRadiologyVal)  ,  radiologyControl.updateRadiology)



      // .delete(validation(paramsIdVal)  , radiologyControl.deleteTest)
      .delete(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(paramsIdVal)  , radiologyControl.deleteRadiology)

export default router ;