import Joi from "joi";



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



export const addPrescriptionVal = Joi.object({
	phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).required().trim() ,
   description:Joi.string().min(10).max(400).trim().required() ,
   file:generalFields.file.required() ,
})




export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})




export const updateTestVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   name:Joi.string().min(1).max(100).trim(),
   description:Joi.string().min(10).max(400).trim(),
   condition:Joi.string().min(10).max(400).trim(),
   company:Joi.string().hex().length(24)
})


