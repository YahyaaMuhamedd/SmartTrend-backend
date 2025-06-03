import Joi from "joi";





export const priceListIdVal = Joi.object({
   listIdTest:Joi.array().items(
      Joi.string().hex().length(24).required() 
   )
})






