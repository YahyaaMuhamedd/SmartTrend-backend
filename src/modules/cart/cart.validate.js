import Joi from "joi";


export const addCartVal = Joi.object({
   test:Joi.string().hex().length(24).required() ,
})



export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})
