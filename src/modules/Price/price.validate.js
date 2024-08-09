import Joi from "joi";



export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})




export const addPriceVal = Joi.object({
   price:Joi.number().min(0) ,
   discount:Joi.number().min(0) ,
   final_amount:Joi.number().min(0) ,
   company:Joi.string().hex().length(24) ,
   test:Joi.string().hex().length(24) 
})


export const updatePriceVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   testName:Joi.string().min(1).max(100).trim() ,
   companyName:Joi.string().min(1).max(100).trim() ,
   price:Joi.number().min(0) ,
   discount:Joi.number().min(0) ,
   final_amount:Joi.number().min(0) ,
   company:Joi.string().hex().length(24) ,
   test:Joi.string().hex().length(24) 
})