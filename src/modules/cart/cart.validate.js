import Joi from "joi";


export const addCartVal = Joi.object({
   test_id:Joi.string().hex().length(24).required() ,
   company_id:Joi.string().hex().length(24).required() 
})



export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})



export const addAllTestsToCartVal = Joi.object({
   company_id:Joi.string().hex().length(24).required() , 
   listIdTest:Joi.array().items(
      Joi.string().hex().length(24).required() 
   ).required()
})


export const addAllTestsToCartByAdminVal = Joi.object({
   userId:Joi.string().hex().length(24).required() , 
   companyId:Joi.string().hex().length(24).required() , 
   listIdTest:Joi.array().items(
      Joi.string().hex().length(24).required() 
   ).required()
})