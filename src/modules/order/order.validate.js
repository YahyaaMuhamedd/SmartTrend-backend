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



export const createOnlineOrderVal = Joi.object({
	patient_Name:Joi.string().min(2).max(50).trim().required() ,
   email: Joi.string().email().required().trim() ,
   patient_Phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).trim().required() ,
   gender:Joi.string().required() ,
   age:Joi.number().required() ,
   birthDay:Joi.date().format('YYYY-MM-DD').required() , 
   profile :Joi.string().required() ,
	payment_method_id:Joi.number().required() ,
})


export const createCashOrderAdminVal = Joi.object({
	patient_Name:Joi.string().min(2).max(50).trim().required() ,
   birthDay:Joi.date().format('YYYY-MM-DD').required() , 
   gender:Joi.string().required() ,
   patient_Phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).trim().required() ,
	listIdTest:Joi.array().items(
		Joi.string().hex().length(24).required() 
	).required() ,
	companyId:Joi.string().hex().length(24).required() 
})



export const paramsIdVal = Joi.object({
	id:Joi.string().hex().length(24).required() 
})


export const cancelOrderVal = Joi.object({
	id:Joi.string().hex().length(24).required() ,
	message:Joi.string().min(2).max(1000).trim()
})



export const addHouseCallVal = Joi.object({
	id:Joi.string().hex().length(24).required() ,
	isHouse_Call:Joi.string()
})


export const generateInvoiceOrderVal = Joi.object({
	order_Number:Joi.string().required() ,
})


export const paidOrderVal = Joi.object({
	orderId:Joi.string().hex().length(24).required() ,
	is_Paid:Joi.string().valid('true', 'false') ,
})

