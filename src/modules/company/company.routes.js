import { Router } from "express";
import * as companyControl from "./company.controller.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { validation } from "../../middleWare/validation.js";
import { addCompanyVal, changeCoverVal, paramsIdVal, updateCompanyVal } from "./company.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";




const router = Router();
//^=========================== Get All Companies, Add Company ==================================
router.route("/")
   .get(companyControl.getAllCompanies)
   // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , companyControl.getAllCompanies)
   .post(protectedRoutes,
      authorize(ROLES.ADMIN),
      multerLocal(validExtension.image, "company").single("file"),
      validation(addCompanyVal),
      companyControl.addCompany)




//^=========================== Get Company Count dashboard =====================================
router.route("/getCompanyCount")
   // .get( companyControl.getCompanyCount)
   .get(protectedRoutes, authorize(ROLES.ADMIN, ROLES.MODERATOR), companyControl.getCompanyCount)



//^=========================== Get Single Company, Update, Delete, Change Image =================
router.route("/:id")
   // .get( validation(paramsIdVal)  , companyControl.getSingleCompany)
   .get(protectedRoutes,
      authorize(ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER),
      validation(paramsIdVal),
      companyControl.getSingleCompany)



   // .put(validation(updateCompanyVal) ,  companyControl.updateCompany)
   .put(protectedRoutes,
      authorize(ROLES.ADMIN),
      validation(updateCompanyVal),
      companyControl.updateCompany)



   // .patch(multerLocal(validExtension.image , "company").single("image") , validation(changeCoverVal) ,  companyControl.changeImgCover) 
   .patch(protectedRoutes,
      authorize(ROLES.ADMIN),
      multerLocal(validExtension.image, "company").single("file"),
      validation(changeCoverVal),
      companyControl.changeImgCover)



   // .delete( validation(paramsIdVal)  , companyControl.deleteCompany)
   .delete(protectedRoutes,
      authorize(ROLES.ADMIN),
      validation(paramsIdVal),
      companyControl.deleteCompany)


export default router;