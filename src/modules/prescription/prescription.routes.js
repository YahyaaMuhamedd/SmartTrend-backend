import { Router } from "express";
import * as prescriptionControl from "./prescription.controller.js";
import {validation} from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";
import { addPrescriptionVal, paramsIdVal } from "./prescription.validate.js";





const router = Router() ;

   router.route("/")
      // .get( prescriptionControl.getAllPrescription)
      .get(protectedRoutes , authorize("admin" , "moderator") , prescriptionControl.getAllPrescription)

      //& Add Prescription :
      .post(protectedRoutes , authorize("admin" , "moderator" , "user") , multerLocal(validExtension.image , "Prescription").single("image"), validation(addPrescriptionVal) ,prescriptionControl.addPrescription)
      

   router.route("/:id")
      // .delete(validation(paramsIdVal)  , prescriptionControl.deletePrescription)
      .delete(protectedRoutes , authorize("admin" , "moderator") , validation(paramsIdVal)  , prescriptionControl.deletePrescription)

      // .patch(validation(paramsIdVal)  , prescriptionControl.seenPrescription)
      .patch(protectedRoutes , authorize("admin" , "moderator") , validation(paramsIdVal)  , prescriptionControl.seenPrescription)



export default router ;
