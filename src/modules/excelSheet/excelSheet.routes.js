import { Router } from "express";
import { addExcelToDatabase, generateExcel , getExcel } from "./excelSheet.controller.js";
import { singleVal } from "./excelSheet.validate.js";
import { validation } from "../../middleWare/validation.js";
import { multerLocal, validExtension } from "../../services/multer.Local.js";




const router  = Router() ; 


//^===========================  ==============================================
router.route("/")
		.get (getExcel) 
		.post (multerLocal(validExtension.excel , "excel").single("file") ,  validation(singleVal) ,  addExcelToDatabase) 
//^===========================  ==============================================
router.route("/downloadExcel")
		.get (generateExcel) 

export default router ;



