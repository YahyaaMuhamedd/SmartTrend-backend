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


export const invoiceVodafoneVal = {
   id:Joi.string().hex().length(24).required() ,

	file:generalFields.file.required() 
}


export const createCashOrderVal = Joi.object({
	patient_Name:Joi.string().min(2).max(50).trim().required() ,
   patient_Phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).trim().required() ,
   birthDay:Joi.date().format('YYYY-MM-DD').required() , 
   gender:Joi.string().required() ,
   patient_Phone:Joi.string().required() ,
   doctor_Name:Joi.string().min(2).max(50).trim().required() ,
   patient_History:Joi.string().min(2).max(500).trim().required() ,
	street:Joi.string() ,
	city:Joi.string() ,
   branch :Joi.string() , 
})




export const onlineSystemVal = Joi.object({
   email:Joi.string().email().required().trim() ,
   invoice_number:Joi.string().min(10).max(10).required() 
})



export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})

