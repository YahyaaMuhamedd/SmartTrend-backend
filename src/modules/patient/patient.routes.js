import { Router } from "express";
import * as PC from "./patient.controller.js";
import { validation } from "../../middleWare/validation.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";
import { addPatientVal, paramsIdVal, updatePatientVal } from "./patient.validate.js";
import { ROLES } from "../../utilities/enums.js";



const router  = Router() ; 


//^=========================== Get Patients, Add Patient =====================================
router.route("/")
      // .get(PC.getAllPatient)
      .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , PC.getAllPatient)
      .post (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(addPatientVal) ,  PC.add_Patient) 


//^=========================== Get Single Patient, Update, Delete  ===========================
router.route("/:id")
      .get(protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR , ROLES.USER) , validation(paramsIdVal) , PC.getSinglePatient)
      .put (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR ) ,  validation(updatePatientVal) , PC.updatePatient) 
      .delete (protectedRoutes , authorize(ROLES.ADMIN , ROLES.MODERATOR ) ,  validation(paramsIdVal) , PC.deletePatient)             

export default router ;


