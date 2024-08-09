import { Router } from "express";
import * as testControl from "./test.controller.js";
import {validation} from "../../middleWare/validation.js";
import { addTestVal, paramsIdVal, updateTestVal } from "./test.validate.js";
import { protectedRoutes } from "../../middleWare/authentication.js";
import { authorize } from "../../middleWare/authorization.js";




const router = Router() ;

router.route("/")
   // .get( testControl.getAllTest)
   .get(protectedRoutes , authorize("admin" , "moderator" ) , testControl.getAllTest)
   
   //& Add Test And Price in Same EndPoint :
   .post(protectedRoutes , authorize("admin" , "moderator") ,  validation(addTestVal) , testControl.testMiddleWare  , testControl.addNewTest)
   
   router.route("/getTestCount")
      // .get( testControl.getTestCount)
      .get(protectedRoutes , authorize("admin" , "moderator") , testControl.getTestCount)





router.route("/:id")
   // .get(validation(paramsIdVal) , testControl.getSingleTest)
   .get(protectedRoutes , authorize("admin" , "moderator") , validation(paramsIdVal) , testControl.getSingleTest)



   // .put(validation(updateTestVal)  ,  testControl.updateTest)
   .put(protectedRoutes , authorize("admin" , "moderator" ) , validation(updateTestVal)  ,  testControl.updateTest)



   // .delete(validation(paramsIdVal)  , testControl.deleteTest)
   .delete(protectedRoutes , authorize("admin" , "moderator") , validation(paramsIdVal)  , testControl.deleteTest)









   
//& Add Test And Price in Same EndPoint :
router.route("/addTestOnly")
      .post(protectedRoutes , authorize("admin" , "moderator") ,  validation(addTestVal)  , testControl.addTestOnly)





export default router ;