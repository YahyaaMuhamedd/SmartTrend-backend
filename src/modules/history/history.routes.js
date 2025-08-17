import { Router } from "express";
import * as PH from "./history.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { ROLES } from "../../utilities/enums.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { addHistoryVal, paramsIdVal } from "./history.validate.js";





const router = Router() ;
//^=========================== Get All Branches , Add Branch ==================================
   router.route("/")
      .get( PH.getAllHistory)
      // .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , PH.getAllHistory)

      .post(
         protectedRoutes ,  
         authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , 
         multerLocal(validExtension.image , "history").array("files"  , 6) , 
         validation(addHistoryVal) , 
         PH.addHistory
      )


//^=========================== Get Single Advert and  Delete =================
   router.route("/historyLoggedUser")
      // .get(PH.getHistorySpecificUser)
      .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , PH.getHistorySpecificUser)


      .delete( validation(paramsIdVal)  , PH.deleteHistory)
      // .delete(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) ,  validation(paramsIdVal)  , PH.deleteHistory)
      

export default router ;