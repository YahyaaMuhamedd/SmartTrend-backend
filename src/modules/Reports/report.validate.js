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




export const getReportVal = Joi.object({
   start :Joi.date().format('YYYY-MM-DD') , 
   end :Joi.date().format('YYYY-MM-DD') , 
   company_id :Joi.string().min(24).max(24) , 
})


export const getReportNewVal = Joi.object({
   start :Joi.date().format('YYYY-MM-DD').optional() , 
   end :Joi.date().format('YYYY-MM-DD').optional() , 
   company_id :Joi.string().min(24).max(24).optional() , 
	patient:Joi.string().min(2).max(30).optional() ,
	specificDay:Joi.string().pattern(/^[0-9]{2}$/).optional() ,
	specificMonth:Joi.string().pattern(/^[0-9]{2}$/).optional() ,
	specificYear:Joi.number().min(2000).optional() ,
})


export const getOrderByPatientNameVal = Joi.object({
   start :Joi.date().format('YYYY-MM-DD') , 
   end :Joi.date().format('YYYY-MM-DD') , 
   company_id :Joi.string().min(24).max(24) , 
   patient :Joi.string() , 
})

