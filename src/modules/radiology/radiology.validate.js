import Joi from "joi";


export const addRadiologyVal = Joi.object({
   name:Joi.string().min(1).max(200).trim().required() ,
   condition:Joi.string().min(10).max(400).trim().required() ,
})




export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})




export const updateRadiologyVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   name:Joi.string().min(1).max(200).trim(),
   condition:Joi.string().min(10).max(400).trim(),
   isActive:Joi.string() ,
})