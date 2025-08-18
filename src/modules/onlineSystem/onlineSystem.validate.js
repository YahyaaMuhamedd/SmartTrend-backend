import coreJoi from "joi"; 
import JoiDate from '@joi/date'; 
const Joi = coreJoi.extend(JoiDate);


const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000 ;

export const generalFields = {
	file:Joi.object({
		size:Joi.number().positive().max(uploadImageSize),
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






export const signInVal = Joi.object({
	email:Joi.string().email().required().trim() ,
   password:Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required() ,
})


export const invoiceInfoVal = Joi.object({
	invoice_number:Joi.string().min(10).max(10).required() 
})


export const approvalVal = Joi.object({
   invoice_number:Joi.string().min(10).max(10).required() 
})

