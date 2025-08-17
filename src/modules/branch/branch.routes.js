import { Router } from "express";
import * as BC from "./branch.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { addBranchVal, paramsIdVal, updateBranchVal } from "./branch.validate.js";
import { ROLES } from "../../utilities/enums.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";





const router = Router() ;
//^=========================== Get All Branches , Add Branch ==================================
   router.route("/")
      .get( BC.getAllBranches)
      // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , BC.getAllCompanies)

      .post(protectedRoutes ,  authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(addBranchVal) , BC.addBranch)




//^=========================== Get Branch Count =================
   router.route("/getBranchCount")
      // .get(BC.getBranchCount)
      .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR)  , BC.getBranchCount)



//^=========================== Add branches By Excel Sheet  ==============================
router.route("/addAllBranchByExcelSheet")
      .post(protectedRoutes , authorize(ROLES.ADMIN)  ,  multerLocal(validExtension.excel , "excel").single("file") , BC.addBranchSheetExcelToDatabase)




//^=========================== Get Single Company, Update, Delete, Change Image =================
   router.route("/:id")
      .get( validation(paramsIdVal)  , BC.getSingleBranch)
      // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(paramsIdVal)  , BC.getSingleBranch)

      // .put( validation(updateBranchVal) ,  BC.updateBranch)
      .put(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(updateBranchVal) ,  BC.updateBranch)
      

      .delete( validation(paramsIdVal)  , BC.deleteBranch)
      // .delete(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(paramsIdVal) , BC.deleteBranch)
      

export default router ;