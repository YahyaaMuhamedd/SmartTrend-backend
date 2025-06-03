import coreJoi from "joi"; 
import JoiDate from '@joi/date'; 
const Joi = coreJoi.extend(JoiDate);


const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000 ;

export const generalFields = {
	file:Joi.object({
		size:Joi.number().positive().max(uploadImageSize),
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
   id:Joi.string().hex().length(24).required() ,
   limit:Joi.string() ,
   keyword:Joi.string() ,

})


export const addPriceVal = Joi.object({
   price:Joi.number().min(0).required() ,
   priceAfterDiscount:Joi.number().min(0).required() ,
   contract_Price:Joi.number().min(0).required() ,
   company:Joi.string().hex().length(24).required() ,
   test:Joi.string().hex().length(24).required() 
})


export const updatePriceVal = Joi.object({
   test:Joi.string().hex().length(24).required() ,
   company:Joi.string().hex().length(24).required() ,


   price:Joi.number().min(0).required() ,
   priceAfterDiscount:Joi.number().min(0).required() ,
   contract_Price:Joi.number().min(0) ,
})


export const updatePriceByIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   price:Joi.number().min(0).required() ,
   priceAfterDiscount:Joi.number().min(0).required() ,
   contract_Price:Joi.number().min(0) ,
})