import coreJoi from "joi"; 
import JoiDate from '@joi/date'; 
const Joi = coreJoi.extend(JoiDate);


export const addPatientVal = Joi.object({
   patient_Name:Joi.string().min(2).max(50).trim().required() ,
   patient_Phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).trim().required() ,
   birthDay:Joi.date().format('YYYY-MM-DD').required() , 
   gender:Joi.string().required() ,
})

export const updatePatientVal = Joi.object({
   id:Joi.string().hex().length(24).required() ,

   patient_Name:Joi.string().min(2).max(50).trim() ,
   patient_Phone:Joi.string().pattern(/^(002)?01[0125][0-9]{8}$/).trim() ,
   birthDay:Joi.date().format('YYYY-MM-DD') , 
   gender:Joi.string() ,
})





export const paramsIdVal = Joi.object({
   id:Joi.string().hex().length(24).required() 
})