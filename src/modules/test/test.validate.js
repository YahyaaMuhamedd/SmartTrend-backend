import Joi from "joi";


export const addTestOnlyVal = Joi.object({
   name:Joi.string().min(1).max(100).trim().required() ,
   description:Joi.string().min(10).max(400).trim().required() ,
   condition:Joi.string().min(10).max(400).trim().required() ,
})

export const addTestVal = Joi.object({
   name:Joi.string().min(1).max(100).trim().required() ,
   description:Joi.string().min(10).max(400).trim().required() ,
   condition:Joi.string().min(10).max(400).trim().required() ,
   company:Joi.string().hex().length(24).required() ,
   price:Joi.number().min(0).required() ,
   priceAfterDiscount:Joi.number().min(0).required() ,
   contract_Price:Joi.number().min(0).required() ,
})




export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})




export const updateTestVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   name:Joi.string().min(1).max(100).trim(),
   description:Joi.string().min(10).max(400).trim(),
   condition:Joi.string().min(10).max(400).trim(),
   company:Joi.string().hex().length(24) ,
   isActive:Joi.string() ,
})


