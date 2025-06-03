import Joi from "joi";

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


export const singleVal = {
	file:generalFields.file.required() ,
}






export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})



export const addAdvertVal = Joi.object({
   title:Joi.string().min(2).max(50).required().trim() ,
   message:Joi.string().min(2).max(50) ,

   file:generalFields.file.required()
})

