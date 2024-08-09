import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { orderModel } from "../../../DataBase/models/order.model.js";
import { testModel } from "../../../DataBase/models/test.model.js";
import { priceModel } from "../../../DataBase/models/price.model.js";
import { cartModel } from "../../../DataBase/models/cart.model.js";
import { userModel } from "../../../DataBase/models/user.model.js";
import slugify from "slugify";


import env from "dotenv"
import fs from "fs" ;
import path from "path" ;

import { customAlphabet } from 'nanoid'
import { patientModel } from "../../../DataBase/models/patient.model.js";
import { create_pdf } from "../../services/create_pdf.js";
import {  pdf_invoice } from "../../templates/pdf.invoice.js";
import { pdf_transform } from "../../templates/pdf.transform.js";
const invoice_nanoid = customAlphabet(process.env.INVOICE_NUMBER, 10) ;
const transform_nanoid = customAlphabet(process.env.TRANSFORM_NUMBER, 10) ;
env.config()




//& Get All order :
export const getAllOrder = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      let result = await orderModel.find();

      //^ Merge Params
      let filterObj = {};

      //^ Filter By Order Type :
      if(filter == "received"){
         filterObj = {
            $or:[
               {is_wrong_Invoice_V_Cash:true} , 
               { is_Paid:true }, 
               {is_Done:true }, 
               {is_Cancel:true}
            ]
         }
      }else if (filter == "sampling"){
         filterObj = {is_Done :true }
      }else if (filter == "cancel"){
         filterObj = {is_Cancel:true}
      }else if (filter == "new"){
         filterObj = {
            is_Paid_Invoice_V_Cash :true  ,   
            is_wrong_Invoice_V_Cash :false ,   
            is_Paid :false   , 
            is_Done :false   , 
            is_Cancel:false    
         }
      }

      let apiFeature = new ApiFeature(orderModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const orders = await apiFeature.mongooseQuery.select("");

      if(!orders.length) return next(new AppError("Orders is Empty" , 404))

      let currentPag = apiFeature.pageNumber ;
      let numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      let limit = apiFeature.limit  ;
      let nextPage = numberOfPages - apiFeature.pageNumber ;
      let prevPage = (numberOfPages - nextPage) - 1 ;

      let metadata = {
         currentPag: currentPag ,
         numberOfPages: numberOfPages || 1 ,
         limit: limit ,
         }

         if(nextPage >  numberOfPages  && nextPage != 0){
            metadata.nextPage  = nextPage
         }
         if(currentPag <=  numberOfPages  && prevPage != 0 ){
            metadata.prevPage  = prevPage
         }
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  orders}) ;
   }
)




//& Get Logged User order :
export const getLoggedUserOrder = catchError(
   async(req , res , next)=>{
      let result = await orderModel.find({user:req.user._id});

      //^ Merge Params
      let filterObj = {user:req.user._id};

      let apiFeature = new ApiFeature(orderModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const orders = await apiFeature.mongooseQuery;

      if(!orders.length) return next(new AppError("Orders is Empty" , 404))

      let currentPag = apiFeature.pageNumber ;
      let numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      let limit = apiFeature.limit  ;
      let nextPage = numberOfPages - apiFeature.pageNumber ;
      let prevPage = (numberOfPages - nextPage) - 1 ;

      let metadata = {
         currentPag: currentPag ,
         numberOfPages: numberOfPages || 1 ,
         limit: limit ,
         }

         if(nextPage >  numberOfPages  && nextPage != 0){
            metadata.nextPage  = nextPage
         }
         if(currentPag <=  numberOfPages  && prevPage != 0 ){
            metadata.prevPage  = prevPage
         }
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  orders}) ;
   }
)



//& Get Order Count :
export const getOrderCount = catchError(
   async(req , res , next)=>{

      //! Cancel Orders :
      const cancelOrder = await orderModel.find({is_Cancel:true});

      //! Done Orders :
      const doneOrder = await orderModel.find({is_Done:true });

      //! Received Orders :
      const receivedOrder = await orderModel.find({
         $or:[
            {is_wrong_Invoice_V_Cash:true} , 
            { is_Paid:true }, 
            {is_Done:true }, 
            {is_Cancel:true}
         ]
      });

      //! Executed Orders :
      const executedOrder = await orderModel.find({
         is_Paid_Invoice_V_Cash:true ,  
         is_Paid:false , 
         is_Done:false ,
         is_Cancel:false
      });


      //! New Orders :
      const newOrder = await orderModel.find({
         is_Paid_Invoice_V_Cash :true  ,   
         is_wrong_Invoice_V_Cash :false ,   
         is_Paid :false   , 
         is_Done :false   , 
         is_Cancel:false    
      });


      //& Get date By Specific Formate 0000-00-00 :
      const date = new Date();
      const day = (date.getDate()).toString().length == 1 ? `0${(date.getDate() - 1)}` :  (date.getDate() -1 ) ;
      const month = (date.getMonth()).toString().length == 1 ? `0${(date.getMonth() + 1)}` :  (date.getMonth() + 1) ;
      const year = date.getFullYear() ;

      const todayDate = `${year}-${month}-${day}T00:00:00Z` ;
      const end = `${year}-${month}-${day}T24:00:00.000+00:00`  ;

      //! Get All Payment Orders Today's :
      const paymentOrder = await orderModel.find({
         is_Paid_Invoice_V_Cash :true  ,   
         is_Paid :true   , 
         is_Done :true   , 
         createdAt:
            {
               $gte: todayDate
               // $gte:`${year}-${month}-${day}T00:00:00Z` ,
            }
      });

      //! Total Price After Discount All Orders :
      const total_Price_After_Discount = paymentOrder.slice(-20).reduce((acc , order)=>{
         return acc + order.total_Price_After_Discount
      } , 0)
      
      //! Total Price Net Amount All Orders :
      const Net_Amount = paymentOrder.slice(-20).reduce((acc , order)=>{
         return acc + order.Net_Amount
      } , 0)
      
      //! Total Today's Profits  :
      const finishProfits = total_Price_After_Discount - Net_Amount ;


      res.json({message:"success" , Order_Data :{
         cancel_Order:{count:cancelOrder.length , cancelOrder} ,
         done_Order:{count:doneOrder.length , doneOrder} ,
         received_Order:{count:receivedOrder.length , receivedOrder} ,
         executed_Order:{count:executedOrder.length , executedOrder} ,
         new_Order:{count:newOrder.length , newOrder} ,
         finish_Profits:finishProfits ,
      }}) ;
   }
)



//& Get All Cancel Orders :
export const  getCancelOrders = catchError(
   async(req , res , next)=>{

      //^ Merge Params
      const{filter} = req.query ;
      let filterObj = {};

      if(filter == "received"){
         filterObj = {
            $or:[
               {is_wrong_Invoice_V_Cash:true} , 
               { is_Paid:true }, 
               {is_Done:true }, 
               {is_Cancel:true}
            ]
         }
      }else if (filter == "sampling"){
         filterObj = {
            is_Paid_Invoice_V_Cash :true  ,   
            is_Paid :true   , 
            is_Done :true   , 
            createdAt:
               {
                  $gte:start ,
                  $lte:end 
               }
         }
      }else if (filter == "cancel"){
         filterObj = {is_Cancel:true}
      }else if (filter == "new"){
         filterObj = {
            is_Paid_Invoice_V_Cash :true  ,   
            is_wrong_Invoice_V_Cash :false ,   
            is_Paid :false   , 
            is_Done :false   , 
            is_Cancel:false    
         }
      }

      let result = await orderModel.find();
      let apiFeature = new ApiFeature(orderModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const orders = await apiFeature.mongooseQuery;

      if(!orders.length) return next(new AppError("Orders is Empty" , 404))

      let currentPag = apiFeature.pageNumber ;
      let numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      let limit = apiFeature.limit  ;
      let nextPage = numberOfPages - apiFeature.pageNumber ;
      let prevPage = (numberOfPages - nextPage) - 1 ;

      let metadata = {
         currentPag: currentPag ,
         numberOfPages: numberOfPages || 1 ,
         limit: limit ,
         }

         if(nextPage >  numberOfPages  && nextPage != 0){
            metadata.nextPage  = nextPage
         }
         if(currentPag <=  numberOfPages  && prevPage != 0 ){
            metadata.prevPage  = prevPage
         }
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  orders}) ;
   }
)



//& Get Logged User order :
export const getSpecificOrder = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      let order = await orderModel.findById(id);

      !order && next(new AppError("Order Not Found" , 404))
      order && res.json({message:"success" , order}) ;
   }
)




//*     ============================================ Cash Order ============================================== 


//& Create Cash Order Logged User Or Old User :
export const createCashOrderLoggedUser = catchError(
   async(req , res , next)=>{
      const {patient_Name  , patient_Age  , gender , address:{street , city} , patient_Phone , doctor_Name , patient_History } = req.patient ;
      const { branch } = req.body ;
      const cart = await cartModel.findOne({user:req.user._id}) ;
      if(!cart) return next(new AppError("Cart Not Found" , 404)) ;

      const company = cart.cartItems[0].price.company ;
      const invoice_number = invoice_nanoid() ;
   
      const order = await orderModel.create({
         user:req.user._id ,
         patient_Name , 
         patient_Age , 
         doctor_Name , 
         cart:cart._id ,
         patient_Phone ,
         patient_History , 
         gender ,
         invoice_number ,
         company ,
         orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , final_amount}})=>({
            test:test ,
            price:price ,
            priceAfterDiscount:priceAfterDiscount ,
            final_amount
         })) ,
         branch_Area: branch ,
         shipping_Address:{
            street: street ,
            city: city ,
         } ,
      })
      
      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(order.patient_Name) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` } , {new:true})
      
      //! Create Invoice Pdf  orders :
      create_pdf(res , pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
      

      //!Delete Cart After Create Order:
      const cartDeleted = await cartModel.findByIdAndDelete(cart._id , {new:true})  ; 

      //& Increase the number of times the test is done : 
      const options =  order.orderItems.map(({test:{_id }})=>{
         return (
            {
               updateOne:{
                  filter:{_id} ,
                  update:{$inc:{count:1}}
               }
            }
         )
      })
      await testModel.bulkWrite(options)



      if(!order) return next(new AppError("Order Failed" , 400)) ;
      res.json({message:"success" , add_Invoice_Order , patient:req.patient})
   }
)

//& Check Patient Exist MiddleWare :
export const checkExistPatient = catchError(
   async(req , res , next)=>{
      const {patient_Name , birthDay , gender , street , city , patient_Phone , doctor_Name , patient_History } = req.body ;

      //& Calculation Age From BirthDay :
      let age = 0 ;
      let nowAge = (birthDay)=>{
         let dateNow = new Date()
         let birth = new Date(birthDay)
         let diff = dateNow - birth
         let age = Math.floor(diff/1000/60/60/24/365);
         return age
      }
      age = nowAge(birthDay)

      //! Added New Patient :
      let existPatient = await patientModel.findOne({patient_Name}) ;
      if(existPatient){
         const patient = await patientModel.findByIdAndUpdate(existPatient._id , {
            patient_Name ,
            patient_Age:age , 
            birthDay , 
            gender ,
            address:{
               street ,
               city  
            } , 
            patient_Phone , 
            doctor_Name , 
            patient_History , 
         } , {new:true})
         if(!patient) return next(new AppError("Patient Not Updated" , 404)) ;
         req.patient = patient
         next()
      }else{
         const patient = await patientModel.create({
            patient_Name , 
            patient_Age:age , 
            birthDay , 
            gender ,
            address:{
               street ,
               city  
            } , 
            patient_Phone , 
            doctor_Name , 
            patient_History , 
         })
         if(!patient) return next(new AppError("Patient Not Added" , 404)) ;
         req.patient = patient
         next()
      }
   }
)





//& Send Invoice Image Vodafone Cash :
export const invoice_VodafoneCash = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const order = await orderModel.findById(id) ;
      if(!order) return next(new AppError("Order Not Found" , 404)) ;

      if(order.user._id.toString() !== req.user._id.toString()){
         return next(new AppError("User Not Owner To Order" , 404)) ;
      }

         if(!req.file) return next(new AppError("Please Enter Image Vodafone Cash Invoice" , 404))
   
         if((req.file.size > +process.env.UPLOAD_IMAGE_SIZE)){
            return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
         }
   
         order.invoice_VodafoneCash = req.file.filename ;
         order.is_Paid_Invoice_V_Cash = true
         order.is_wrong_Invoice_V_Cash = false

         await order.save() ;
         
         //! Delete Image from Server Disk :
         // const fileName = "Uploads/company/" + path.basename(company.logo)
         // fs.unlinkSync(path.resolve(fileName))

      res.json({message:"Success Added Image Cash Order" })
   }
)



//& Confirmed Cash Order :
export const confirmCashOrder = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const order = await orderModel.findById(id) ;
      if(!order) return next(new AppError("Order Not Found" , 404)) ;

      if(order.is_Paid)  return next(new AppError("The order has already been paid" , 404)) ;
      order.is_Paid = true;
      await order.save() ;



      //& Increase the number of times the test is done : 
      const options =  order.orderItems.map(({test:{_id}})=>{
         return (
            {
               updateOne:{
                  filter:{_id} ,
                  update:{$inc:{count:1}}
               }
            }
         )
      })
      await testModel.bulkWrite(options)

      res.json({message:"success" })
   }
)



//& Change Wrong Invoice True Or False :
export const updateOrder = catchError(
   async(req , res , next)=>{
      const {isHouse_Call , approved , reSendInvoice_V_Cash} = req.query ;
      const {id} = req.params ;

      const order = await orderModel.findById(id) ;
      if(!order) return next(new AppError("Order Not Found" , 404)) ;

      // if(reSendInvoice_V_Cash && order.is_wrong_Invoice_V_Cash.toString() === reSendInvoice_V_Cash){
      //    return next(new AppError(`Is Wrong Invoice Vodafone Cash Already ${reSendInvoice_V_Cash} ` , 404)) ;
      // }
      if(isHouse_Call){
         order.isHouse_Call = isHouse_Call;
         await order.save() ;
      }

      if(approved){
         order.is_Paid = approved;
         await order.save() ;
      }

      if(reSendInvoice_V_Cash){
         order.is_wrong_Invoice_V_Cash = reSendInvoice_V_Cash;
         await order.save() ;
      }
      res.json({message:"success" })
   }
)




//& Cancel Cash Order :
export const cancelCashOrder = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const {message} = req.body ;

      const order = await orderModel.findById(id) ;
      if(!order) return next(new AppError("Order Not Found" , 404)) ;

      if(!order.is_Cancel)  {
         order.is_Paid = false ;
         order.is_Cancel = true ;
         order.message = message ;
         await order.save() ;
      }else{
         return next(new AppError("Order Already Canceled" , 404)) ;
      }

      //& Increase the number of times the test is done : 
      const options =  order.orderItems.map(({test:_id})=>{
         return (
            {
               updateOne:{
                  filter:{test:{_id}} ,
                  update:{$inc:{count:-1}}
               }
            }
         )
      })
      await testModel.bulkWrite(options)

      res.json({message:"success" })
   }
)



//& Cancel Cash Order :
export const rejectedCashOrder = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const {message} = req.body ;

      const order = await orderModel.findById(id) ;
      if(!order) return next(new AppError("Order Not Found" , 404)) ;

      if(!order.is_wrong_Invoice_V_Cash)  {
      order.is_Paid = false ;
      order.is_wrong_Invoice_V_Cash = true
      order.message = message ;
      await order.save() ;
      }else{
         return next(new AppError("Order Already Rejected" , 404)) ;
      }

      //& Increase the number of times the test is done : 
      const options =  order.orderItems.map(({test:_id})=>{
         return (
            {
               updateOne:{
                  filter:{test:{_id}} ,
                  update:{$inc:{count:-1}}
               }
            }
         )
      })
      await testModel.bulkWrite(options)

      res.json({message:"success" })
   }
)



//& Generate Invoice Cash Order :
export const generateInvoiceOrder = catchError(
   async(req , res , next)=>{

      const {id} = req.params;

      const order =  await orderModel.findById(id)
      if(!order) return next(new AppError("Order Not Found" , 404));

      
      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(order.patient_Name) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` } , {new:true})
      
      //! Create Invoice Pdf  orders :
      create_pdf(res , pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
      
      
      res.json({message:" Generate Invoice Cash Order successfully"  , add_Invoice_Order})
   }
)



//& Cancel Cash Order :
export const deleteOrder = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const order = await orderModel.findByIdAndDelete(id , {new:true}) ;

      if(order){
         //! Delete Invoice Order from Server Disk :
         if(!(path.basename(order.invoice_pdf) === "undefined")){
            const fileNameInvoice = "Docs/" + path.basename(order.invoice_pdf)
            fs.unlinkSync(path.resolve(fileNameInvoice))
         }


         //! Delete Transformation from Server Disk :
         if(!(path.basename(order.transform_pdf) === "undefined")){
            const fileNameTransformation = "Docs/" + path.basename(order.transform_pdf)
            fs.unlinkSync(path.resolve(fileNameTransformation))
         }


         // //! Delete Image V_Cash from Server Disk :
         if(!(path.basename(order.invoice_VodafoneCash) === "undefined")){
            const fileNameV_Cash = "Uploads/Invoice.V_Cash/" + path.basename(order.invoice_VodafoneCash)
            fs.unlinkSync(path.resolve(fileNameV_Cash))
         }

      }else{
         return next(new AppError("Order Not Found" , 404)) ;
      }

      res.json({message:"success" })
   }
)





//^================ auth By Company Token ========================

//& Confirmed Online System in Branch Laboratory :
export const transformOnlineSystem = catchError(
   async(req , res , next)=>{
      // console.log(req.body.invoice_number , req.body.email);
      const {invoice_number , email} = req.body ;
      console.log(req.company?.email);
      const transform_number =  transform_nanoid();
      
      const order = await orderModel.findOne({
         invoice_number , 
         is_Cancel:false , 
         is_Paid:true , 
         is_Paid_Invoice_V_Cash:true , 
         is_Done:false
      }) ;

      
      if(!order) return next(new AppError("Order Not Found Please Connect On Hot line :3245" , 404)) ;
      if(order.company?.email !== req.company?.email) return next(new AppError("Company Not Valid Please Connect On Hot line :3245" , 404)) ;
      
      console.log(order.company?.email);
      const patient_Name_Slug = slugify(order.patient_Name) ;

      order.is_Done = true ;
      order.branch_Approved_Email = email
      order.transform_number =  transform_number;
      order.transform_pdf  = `transform_${patient_Name_Slug}_${order._id}.pdf`
      await order.save() ;



      //! Added Transformation to this Order :
      // const add_transform_Order = await orderModel.findByIdAndUpdate(order._id , {transform_pdf  : `transform_${patient_Name_Slug}_${order._id}` } , {new:true})

      //! Create Transformation invoice Pdf  Orders :
      create_pdf(res , pdf_transform , order , `transform_${patient_Name_Slug}_${order._id}`);


      // res.json({DownLoad_Link:`<a href='${process.env.BASE_URL}pdf/transform_${patient_Name_Slug}_${order._id}.pdf'>Download</a>`})
      res.json({message:"success" , url:`${process.env.BASE_URL}pdf/transform_${patient_Name_Slug}_${order._id}.pdf`}) ;
   }
)



//& Get And Search Approved Order Confirmed Online System ion Branch :
export const getApprovedOrder = catchError(
   async(req , res , next)=>{
      const {invoice_number} = req.query ;
      
      const order = await orderModel.findOne({invoice_number}) ;
      !order &&  next(new AppError("Order Not Found Please Connect On Hot line :3245" , 404)) ;
      
      res.json({message:"success" , order:{
         patient_Name:order.patient_Name ,
         patient_Phone:order.patient_Phone ,
         patient_Age:order.patient_Age ,
         patient_History:order.patient_History ,
         gender:order.gender ,
         invoice_number:order.invoice_number ,
         is_Paid:order.is_Paid ,
         is_Cancel:order.is_Cancel ,
         is_Done:order.is_Done ,
      }}) ;
   }
)

