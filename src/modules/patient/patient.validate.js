import coreJoi from "joi"; 
import JoiDate from '@joi/date'; 
const Joi = coreJoi.extend(JoiDate);






export const generalFields = {
	file:Joi.object({
		size:Joi.number().positive().max(+process.env.UPLOAD_IMAGE_SIZE),
		path:Joi.string(),
		filename:Joi.string(),
		destination:Joi.string(),
		mimetype:Joi.string(),
		encoding:Joi.string(),
		originalname:Joi.string(),
		fieldname:Joi.string(),
		finalDest:Joi.string()
	})
}



export const singleVal = {
	file:generalFields.file.required() ,
}



export const addPatientVal = Joi.object({
   patient_Name:Joi.string().min(2).max(50).trim() ,
   patient_Phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).trim() ,
   birthDay:Joi.date().format('YYYY-MM-DD') , 
   gender:Joi.string() ,
   patient_Phone:Joi.string().required() ,
   doctor_Name:Joi.string().min(2).max(50).trim() ,
   patient_History:Joi.string().min(2).max(500).trim() ,
   address:Joi.object({
      street:Joi.string() ,
      city:Joi.string() ,
   })
})





export const updatePatientVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   patient_Name:Joi.string().min(2).max(50).trim() ,
   patient_Phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).trim() ,
   birthDay:Joi.date().format('YYYY-MM-DD') , 
   gender:Joi.string() ,
   patient_Phone:Joi.string() ,
   doctor_Name:Joi.string().min(2).max(50).trim() ,
   patient_History:Joi.string().min(2).max(500).trim() ,
   address:Joi.object({
      street:Joi.string() ,
      city:Joi.string() ,
   })
})





export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})