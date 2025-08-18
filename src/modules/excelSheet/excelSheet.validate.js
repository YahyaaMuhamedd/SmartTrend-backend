import coreJoi from "joi"; 
import JoiDate from '@joi/date'; 
const Joi = coreJoi.extend(JoiDate);

const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000;

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



export const singleVal = Joi.object({
   file:generalFields.file.required() ,
})


export const addExcelVal = Joi.object({
   name:Joi.string().min(2).max(50).required().trim() ,
   phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).required().trim() ,
   email:Joi.string().email().required().trim() ,
})

