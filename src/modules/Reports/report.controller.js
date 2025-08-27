import { AppError } from "../../utilities/AppError.js";
import { catchError } from "../../utilities/catchError.js";
import { orderModel } from "../../../DataBase/models/order.model.js";
import { create_pdf } from "../../services/create_pdf.js";
import { pdf_Report_data } from "../../templates/pdf.report_data.js";
import { getDateRange } from "../../services/getDateRange.js";
import { pdf_Report_data_contract_price } from "../../templates/pdf_Report_data_contract_price.js";
import { companyModel } from "../../../DataBase/models/company.model.js";
import { exportExcel } from "../../services/exportExcel.js";







//& Get All Orders By Date From Specific Date To Specific Date  :
export const getReportOrders = catchError(
   async(req , res , next)=>{
      const {start ,  end , company , patient } = req.body ;
      const {saveMethod} = req.query ;

      let orders = [];
      const time = getDateRange(start , end) ;
      const dateStart = time.start ;
      const dateEnd =  time.end ;

      //^ Handle Object Filter And Indicate The Variable Value Is Sended :
      let dateObj = {$gte: dateStart , $lte: dateEnd} ;

      //^ Handle Query To Database :
      if(company && patient){
         orders = await orderModel.find({createdAtOrder:
            dateObj , 
            company:company , 
            $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(patient){
         orders = await orderModel.find({createdAtOrder:
            dateObj , 
            $or:[
               {patient_Name:patient} ,
               {patient_Phone:patient} ,
            ]
         })
      }else if(company){
         orders = await orderModel.find({createdAtOrder:
            dateObj , company:company
         })
      }else{
         orders = await orderModel.find({createdAtOrder:
            dateObj
         })
      }
      

      //! Create Report  :
      try {
         if(orders.length <= 0) return next(new AppError("Not Data Exist" , 404))
         const userId = req.user._id.toString() ;
         const order_Info = {date:{start , end} , orders} ;

         if(saveMethod === "pdf"){
            const pathFile = await create_pdf(pdf_Report_data , order_Info , `${userId}_report_data`) ;
            res.json({message:"success" , orders , pathFile}) ;
         }else if(saveMethod === "excel"){
            const selectedFields = [
               "order_Number", 
               "patient_Name", 
               "patient_Phone" , 
               "company" , 
               "invoice_number" , 
               "date" ,
               "payment_Type" ,
               "total_Price_After_Discount",
               "Net_Amount",
            ];
            
            const orders = order_Info.orders ; 
            const newOrder = orders.map((ele)=>{
               return {
                  order_Number:ele.order_Number ,
                  patient_Name:ele.patient_Name ,
                  patient_Phone:ele.patient_Phone ,
                  invoice_number:ele.invoice_number ,
                  company:ele.company.name ,
                  date:ele.createdAt? new Date(ele.createdAt) : "" ,
                  payment_Type:ele.payment_Type ,
                  total_Price_After_Discount:ele.total_Price_After_Discount ,
                  Net_Amount:ele.Net_Amount ,
               }
            })
            const path = await exportExcel(newOrder , 25 , "excel_report.xlsx", selectedFields);
            res.json({message: "success", pathFile: `${process.env.BASE_URL}/pdf/${path}`});
         }
      } catch (error) {
         return next(new AppError("Report File creation failed", 500));
      }
   }
) ;







//& Get All Orders By Date From Specific Date To Specific Date  :
export const getReportContractPrice = catchError(
   async(req , res , next)=>{
      const {start ,  end , company } = req.body ;
      const {saveMethod} = req.query ;


      let orders = [];
      const time = getDateRange(start , end) ;
      const dateStart = time.start ;
      const dateEnd =  time.end ;
      let companyExist;
      //^ Handle Object Filter And Indicate The Variable Value Is Sended :
      let dateObj = {$gte: dateStart , $lte: dateEnd} ;

      //^ Handle Query To Database :
   
      if(company){
         companyExist = await companyModel.findById(company) ;
         if(!companyExist) return next(new AppError("Company Not Exist", 404));

         orders = await orderModel.find({createdAtOrder:
            dateObj , company:company
         })
      }
      

      //! Create Report  :
      try {
         if(orders.length <= 0) return next(new AppError("Not Data Exist" , 404))
         const userId = req.user._id.toString() ;
         const order_Info = {date:{start , end} , company:companyExist ,  orders} ;



         if(saveMethod === "pdf"){
            const pathFile = await create_pdf(pdf_Report_data_contract_price , order_Info , `${userId}_report_data`) ;
            res.json({message:"success" , orders , pathFile}) ;
         }else if(saveMethod === "excel"){
            const selectedFields = [
               "order_Number",  
               "invoice_number" , 
               "transform_number" , 
               "date" ,
               "Contract_Price" ,
            ];
            
            const orders = order_Info.orders ; 
            const newOrder = orders.map((ele)=>{
               return {
                  order_Number:ele.order_Number ,
                  invoice_number:ele.invoice_number ,
                  transform_number:ele.transform_number ,
                  date:ele.createdAt? new Date(ele.createdAt) : "" ,
                  Contract_Price:ele.Contract_Price ,
               }
            })
            const path = await exportExcel(newOrder , 25 , "excel_report.xlsx", selectedFields);
            res.json({message: "success", pathFile: `${process.env.BASE_URL}/pdf/${path}`});
         }


      } catch (error) {
         return next(new AppError("Report File creation failed", 500));
      }
   }
) ;