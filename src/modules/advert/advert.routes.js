import { Router } from "express";
import * as AC from "./advert.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { addAdvertVal, paramsIdVal } from "./advert.validate.js";





const router = Router() ;
//^=========================== Get All Branches , Add Branch ==================================
   router.route("/")
      .get( AC.getAllAdverts)
      // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , AC.getAllAdverts)

      .post(protectedRoutes ,  authorize(ROLES.ADMIN , ROLES.MODERATOR) , multerLocal(validExtension.image , "advert").single("file"), validation(addAdvertVal) , AC.addAdvert)


//^=========================== Get Single Advert and  Delete =================
   router.route("/:id")
      .get( validation(paramsIdVal)  , AC.getSingleAdvert)
      // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) , validation(paramsIdVal)  , AC.getSingleAdvert)


      .delete( validation(paramsIdVal)  , AC.deleteAdvert)
      // .delete(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR) ,  validation(paramsIdVal)  , AC.deleteAdvert)
      

export default router ;