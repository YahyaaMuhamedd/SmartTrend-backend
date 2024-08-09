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




export const getReportVal = Joi.object({
   start :Joi.date().format('YYYY-MM-DD') , 
   end :Joi.date().format('YYYY-MM-DD') , 
   company_id :Joi.string().min(24).max(24) , 
})


export const getOrderByPatientNameVal = Joi.object({
   start :Joi.date().format('YYYY-MM-DD') , 
   end :Joi.date().format('YYYY-MM-DD') , 
   company_id :Joi.string().min(24).max(24) , 
   patient :Joi.string() , 
})

