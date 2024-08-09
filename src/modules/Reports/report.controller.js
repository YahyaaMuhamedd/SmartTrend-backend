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


      let formateDateStart = `${start}T00:00:00Z` ;
      let formateDateEnd = `${end}T23:59:59Z` ;


      let dateObj = {} ;
      if(start && end){
         dateObj = {$gte: new Date(formateDateStart) , $lt: new Date(formateDateEnd)}
      }else  if(start){
         dateObj = {$gte: new Date(formateDateStart)}
      }else{
         dateObj = {$gte: "2024-01-01T00:00:00z"}
      }



      if(company_id){
         orders = await orderModel.find({createdAt:
            dateObj , company:company_id
         })
      }else{
         orders = await orderModel.find({createdAt:
            dateObj
         })
      }

      const order_Info = {date:{start , end} , orders}
      const pathFile = create_pdf( res , pdf_Report_data , order_Info , "report_data")

      res.json({message:"success" , orders , pathFile})
      // res.end(`<a  aria-autocomplete href="${pathFile}">Download</a>`)
   }
)



//& Get All Orders By Date From Specific Date To Specific Date  :
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

      let formateDateStart = start ;
      let formateDateEnd = end
      // let formateDateStart = `${start}T00:00:00Z` ;
      // let formateDateEnd = `${end}T23:59:59Z` ;


      let dateObj = {} ;
      if(start && end){
         dateObj = {$gte: formateDateStart , $lt: formateDateEnd}
         // dateObj = {$gte: new Date(formateDateStart) , $lt: new Date(formateDateEnd)}
      }else  if(start){
         dateObj = {$gte: formateDateStart}
         // dateObj = {$gte: new Date(formateDateStart)}
      }else{
         dateObj = {$gte: "2024-01-01T00:00:00z"}
      }


      if(company_id && patient){
         orders = await orderModel.find({createdAt:
            dateObj , company:company_id , $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(!company_id){
         orders = await orderModel.find({createdAt:
            dateObj , $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(!patient){
         return new AppError("Patient is required" , 404)
      }

      // if(company_id){
      //    orders = await orderModel.find({createdAt:
      //       dateObj , company:company_id
      //    })
      // }else{
      //    orders = await orderModel.find({createdAt:
      //       dateObj
      //    })
      // }

      const order_Info = {date:{start , end}  , patientExist , orders}
      const pathFile = create_pdf( res , pdf_Report_data , order_Info , "report_data")

      res.json({message:"success" , orders , pathFile})
   }
)


