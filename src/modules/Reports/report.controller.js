import { AppError } from "../../utilities/AppError.js";
import { catchError } from "../../utilities/catchError.js";
import { orderModel } from "../../../DataBase/models/order.model.js";
import { create_pdf } from "../../services/create_pdf.js";
import { pdf_Report_data } from "../../templates/pdf.report_data.js";
import { patientModel } from "../../../DataBase/models/patient.model.js";



//& Get All Orders By Date From Specific Date To Specific Date  :
export const getAllOrdersReports = catchError(
   async(req , res , next)=>{
      const {start ,  end , company_id} = req.query ;
      let orders = [];


      
      const  dateStart = new Date(`${start}T00:00:00z`).getTime() ;
      const  dateEnd = new Date(`${end}T24:00:00z`).getTime() ;
      const  dateNow = new Date().getTime() ;
      const currentYear = new Date().getFullYear() ;
      
      let currentMonth = ""
      const currentDate = new Date();
      const formate = currentDate.getMonth() + 1
      if(formate > 9){
         currentMonth = formate ;
      }else{
         currentMonth = `0${formate }`;
      }




      let dateObj = {} ;
      if(start && end){
         dateObj = {$gte: dateStart , $lt: dateEnd}
      }else  if(start){
         dateObj = {$gte: dateStart , $lte: dateNow}
      }else{
         dateObj = {$gte: new Date(`${currentYear}-${currentMonth}-01T00:00:00z`).getTime()}
      }



      if(company_id){
         orders = await orderModel.find({createdAtOrder:
            dateObj , company:company_id
         })
      }else{
         orders = await orderModel.find({createdAtOrder:
            dateObj
         })
      }
      
      const order_Info = {date:{start , end} , orders}
      const pathFile = create_pdf( res , pdf_Report_data , order_Info , "report_data")
      
      res.json({message:"success" , orders , pathFile})
   }
)


//& Get All Orders By Date From Specific Date To Specific Date  :
export const getAllOrdersFilterNew = catchError(
   async(req , res , next)=>{
      const {start ,  end , company_id , patient , specificDay , specificMonth , specificYear} = req.body ;
      let orders = [];


      //^ Handle Start Date And End Date :
      const  dateStart = new Date(`${start}T00:00:00z`).getTime() ;
      const  dateEnd = new Date(`${end}T23:59:59z`).getTime() ;
      const  dateNow = new Date().getTime() ;


      //^ Handle Current Year  :
      const currentYear = new Date().getFullYear() ;
      

      //^ Handle Current Month Formate [00] After Validation To Confirm  The Correct Formate Of The Month:
      let currentMonth = ""
      const currentDate = new Date();
      const formate = currentDate.getMonth() + 1
      if(formate > 9){
         currentMonth = formate ;
      }else{
         currentMonth = `0${formate }`;
      }




      //^ Handle Object Filter And Indicate The Variable Value Is Sended :
      let dateObj = {} ;
      if(start && end){
         dateObj = {$gte: dateStart , $lt: dateEnd}
      }else  if(start){
         dateObj = {$gte: dateStart , $lte: dateNow}
      }else if(specificDay && specificMonth && specificYear){
         dateObj = {$gte: new Date(`${specificYear}-${specificMonth}-${specificDay}T00:00:00z`).getTime() , $lte: new Date(`${specificYear}-${specificMonth}-${specificDay}T24:00:00z`).getTime()}
      }else if(specificDay){
         dateObj = {$gte: new Date(`${currentYear}-${currentMonth}-${specificDay}T00:00:00z`).getTime() , $lte: new Date(`${currentYear}-${currentMonth}-${specificDay}T24:00:00z`).getTime()}
      }else if(specificMonth){
         dateObj = {$gte: new Date(`${specificYear || currentYear}-${specificMonth}-01T00:00:00z`).getTime() , $lte: new Date(`${specificYear || currentYear}-${specificMonth}-31T24:00:00z`).getTime()}
      }else if(specificYear){
         dateObj = {$gte: new Date(`${specificYear}-01-01T00:00:00z`).getTime() , $lte: new Date(`${specificYear}-12-31T23:59:59z`).getTime()}
      }else{
         dateObj = {$gte: new Date(`${currentYear}-${currentMonth}-01T00:00:00z`).getTime()}
      }


      //^ Handle Query To Database :
      if(company_id && patient){
         orders = await orderModel.find({createdAtOrder:
            dateObj , company:company_id , $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(patient){
         orders = await orderModel.find({createdAtOrder:
            dateObj , $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(company_id){
         orders = await orderModel.find({createdAtOrder:
            dateObj , company:company_id
         })
      }else{
         orders = await orderModel.find({createdAtOrder:
            dateObj
         })
      }
      


      //^ Handle Generate File Contain Information Orders :
      const order_Info = {date:{start , end} , orders}
      const pathFile = create_pdf( res , pdf_Report_data , order_Info , "report_data")
      res.json({message:"success" , orders , pathFile})
   }
)





//& Get All Orders By Date From Specific Date To Specific Date and Patient Name  :
export const getOrderByPatientName = catchError(
   async(req , res , next)=>{
      const {start ,  end , patient , company_id} = req.query ;
      let orders = [];

      const patientExist = await patientModel.findOne({$or:[
         {patient_Name:patient} ,
         {patient_Phone:patient} ,
      ]})
      if(!patientExist){
         return new AppError("Patient Not Exist" , 404)
      }

      let  dateStart = new Date(`${start}T00:00:00z`).getTime();
      let  dateEnd = new Date(`${end}T23:59:59z`).getTime();
      let  dateNow = new Date().getTime();


      let dateObj = {} ;
      if(start && end){
         dateObj = {$gte: dateStart , $lt: dateEnd}
      }else  if(start){
         dateObj = {$gte: dateStart , $lte: dateNow}
      }else{
         dateObj = {$gte: new Date(`2024-01-01T00:00:00z`).getTime() }
      }


      if(company_id && patient){
         orders = await orderModel.find({createdAtOrder:
            dateObj , company:company_id , $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(!company_id){
         orders = await orderModel.find({createdAtOrder:
            dateObj , $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(!patient){
         return new AppError("Patient is required" , 404)
      }

      const order_Info = {date:{start , end}  , patientExist , orders}
      const pathFile = create_pdf( res , pdf_Report_data , order_Info , "report_data")

      res.json({message:"success" , orders , pathFile})
   }
)
