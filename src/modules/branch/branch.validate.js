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






export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})



export const addBranchVal = Joi.object({
   name:Joi.string().min(1).max(100).required().trim() ,
   email:Joi.string().email().required().trim() ,
   phone:Joi.string().pattern(/^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/).required() ,
	password:Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required() ,
   street:Joi.string().min(1).max(100).trim() ,
   city:Joi.string().min(1).max(100).trim() ,
   area:Joi.string().min(1).max(100).trim() ,
	company:Joi.string().hex().length(24).required() 
})


export const updateBranchVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   name:Joi.string().min(1).max(100).trim() ,
   email:Joi.string().email().trim() ,
   phone:Joi.string().pattern(/^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/) ,
	password:Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/) ,
   street:Joi.string().min(1).max(100).trim() ,
   city:Joi.string().min(1).max(100).trim() ,
   area:Joi.string().min(1).max(100).trim() ,
	company:Joi.string().hex().length(24) 
})
