import { AppError } from "../../utilities/AppError.js";
import { catchError } from "../../utilities/catchError.js";
import { orderModel } from "../../../DataBase/models/order.model.js";
import { create_pdf } from "../../services/create_pdf.js";
import { pdf_Report_data } from "../../templates/pdf.report_data.js";
import { getDateRange } from "../../services/getDateRange.js";
import { pdf_Report_data_contract_price } from "../../templates/pdf_Report_data_contract_price.js";
import { companyModel } from "../../../DataBase/models/company.model.js";







//& Get All Orders By Date From Specific Date To Specific Date  :
export const getReportOrders = catchError(
   async(req , res , next)=>{
      const {start ,  end , company , patient } = req.body ;

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
         console.log("orders", order_Info);
         const pathFile = await create_pdf(pdf_Report_data , order_Info , `${userId}_report_data`) ;
         
         res.json({message:"success" , orders , pathFile}) ;
      } catch (error) {
         return next(new AppError("Report PDF creation failed", 500));
      }
   }
) ;




//& Get All Orders By Date From Specific Date To Specific Date  :
export const getReportContractPrice = catchError(
   async(req , res , next)=>{
      const {start ,  end , company } = req.body ;

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
         const pathFile = await create_pdf(pdf_Report_data_contract_price , order_Info , `${userId}_report_data`) ;
         res.json({message:"success" , orders , pathFile}) ;
      } catch (error) {
         return next(new AppError("Report PDF creation failed", 500));
      }
   }
) ;