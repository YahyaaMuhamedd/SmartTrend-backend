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

export const changeCoverVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

	file:generalFields.file.required() ,
})



export const addCompanyVal = Joi.object({
   name:Joi.string().min(1).max(100).required().trim() ,
   address:Joi.string().min(1).max(100).required().trim() ,
   phone:Joi.string().pattern(/^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/).required() ,
   description:Joi.string().min(10).max(400).required().trim() ,
   email:Joi.string().email().required().trim() ,



	file:generalFields.file.required() ,

})






export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})




export const updateCompanyVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   name:Joi.string().min(1).max(100).trim() ,
   email:Joi.string().email().required().trim() ,
   phone:Joi.string().pattern(/^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/) ,
   address:Joi.string().min(10).max(400).trim() ,
   description:Joi.string().min(10).max(400).trim() ,
   isActive:Joi.string().valid(true , false),
})



