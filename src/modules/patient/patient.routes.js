import { Router } from "express";
import * as PC from "./patient.controller.js";
import { validation } from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { addPatientVal, paramsIdVal, updatePatientVal } from "./patient.validate.js";



const router  = Router() ; 



router.route("/")
      // .get(PC.getAllPatient)
      .get(protectedRoutes , authorize("admin" , "moderator" , "user") , PC.getAllPatient)
      .post (protectedRoutes , authorize("admin" , "moderator" , "user") , validation(addPatientVal) ,  PC.add_Patient) 

router.route("/:id")
      .get(protectedRoutes , authorize("admin" , "moderator" , "user") , validation(paramsIdVal) , PC.getSinglePatient)
      .put (protectedRoutes , authorize("admin" , "moderator") ,  validation(updatePatientVal) , PC.updatePatient) 
      .delete (protectedRoutes , authorize("admin" , "moderator") ,  validation(paramsIdVal) , PC.deletePatient)             



export default router ;


