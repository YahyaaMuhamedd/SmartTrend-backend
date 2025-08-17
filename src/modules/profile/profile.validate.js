import Joi from "joi";

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




export const addProfileVal = Joi.object({
   name:Joi.string().min(2).max(30).required().trim() ,
   description:Joi.string().min(2).max(2000).required().trim() ,
   discount:Joi.number().required() ,
   listIdTest: Joi.array().items(Joi.string().hex().length(24).required()).required() ,
   company: Joi.string().hex().length(24).required() ,

	file:generalFields.file.required() ,
})




export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})




