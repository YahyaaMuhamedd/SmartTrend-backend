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


export const addUserVal = Joi.object({
   name:Joi.string().min(2).max(50).required().trim() ,
   phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).required().trim() ,
   birthDay:Joi.date().format('YYYY-MM-DD') , 
   role:Joi.string().valid("user" , "admin" , "moderator").required() ,
   email:Joi.string().email().required().trim() ,
   password:Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required() ,
   rePassword:Joi.valid(Joi.ref("password")).required()
})

export const updateUserRoleVal = Joi.object({
   role:Joi.string().valid("user" , "admin" , "moderator").required() ,
})







export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})


export const blockedAndActiveUserVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,
   block:Joi.boolean().optional(),
   // active:Joi.boolean().optional(),
})




export const updateUserVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   name:Joi.string().min(2).max(50).trim() ,
   phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).required().trim() ,
   birthDay:Joi.date().format('YYYY-MM-DD') , 
   email:Joi.string().email().trim() ,
})



