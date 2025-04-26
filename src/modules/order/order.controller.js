import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { orderModel } from "../../../DataBase/models/order.model.js";
import { testModel } from "../../../DataBase/models/test.model.js";
import { cartModel } from "../../../DataBase/models/cart.model.js";


import slugify from "slugify";
import env from "dotenv"
import fs from "fs" ;
import path from "path" ;
import axios from 'axios';


import { customAlphabet } from 'nanoid'
import { patientModel } from "../../../DataBase/models/patient.model.js";
import { create_pdf } from "../../services/create_pdf.js";
import {  pdf_invoice } from "../../templates/pdf.invoice.js";
import { getNextOrderNumber } from "../../handlers/getNextOrderNumber.js";
import { getDateRange } from "../../utilities/getDateRange.js";
env.config() ;


const alphabet = process.env.INVOICE_NUMBER || '123456789';
const invoice_nanoid = customAlphabet(alphabet , 10) ;







//& Get All order :
export const getAllOrder = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      let result = await orderModel.find();

      //^ Merge Params
      let filterObj = {};

      //^ Filter By Order Type :
      if (filter == "sampling"){
         filterObj = {is_Approved :true , is_Paid :true }
      }else if (filter == "cancel"){
         filterObj = {is_Cancel:true}
      }else if (filter == "new"){
         filterObj = {   
            is_Paid :true   , 
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
      const approvedOrder = await orderModel.find({is_Approved:true , is_Paid:true , is_Cancel:false});


      //! Executed Orders :
      const executedOrder = await orderModel.find({
         is_Paid:true ,
         is_Cancel:false
      });


      //& Get Today :
      const start = getDateRange().start
      const end = getDateRange().end


      //! Get All Payment Orders Today's :
      const paymentOrder = await orderModel.find({ 
         is_Paid :true   ,
         is_Cancel:false , 
         // is_Approved :true   , 
         createdAtOrder: {
            $gte: start,
            $lte: end
         }
      });

      //! Total Price After Discount All Orders :
      const total_Price_After_Discount = paymentOrder.reduce((acc , order)=>{
         return acc + order.total_Price_After_Discount
      } , 0)
      
      //! Total Price Net Amount All Orders :
      const Net_Amount = paymentOrder.reduce((acc , order)=>{
         return acc + order.Net_Amount
      } , 0)
      
      //! Total Today's Profits  :
      const finishProfits = total_Price_After_Discount - Net_Amount ;


      res.json({message:"success" , Order_Data :{
         cancel_Order:{count:cancelOrder.length , cancelOrder} ,
         approvedOrder:{count:approvedOrder.length , approvedOrder} ,
         executed_Order:{count:executedOrder.length , executedOrder} ,
         new_Order:{count:paymentOrder.length , paymentOrder} ,
         finish_Profits:finishProfits ,
      }}) ;
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
export const createCashOrder = catchError(
   async(req , res , next)=>{

      const {patient_Name, patient_Age, gender, address:{street, city}, patient_Phone, doctor_Name, patient_History } = req.patient ;
      const cart = await cartModel.findOne({user:req.user._id}) ;
      if(!cart) return next(new AppError("Cart Not Found", 404)) ;

      const company = cart.cartItems[0].price.company ;
      const invoice_number = invoice_nanoid() ;
      const order_Number = await getNextOrderNumber() ;

      const order = await orderModel.create({
         order_Number ,
         user:req.user._id ,
         patient_Name , 
         patient_Age , 
         doctor_Name , 
         cart:cart._id ,
         patient_Phone ,
         patient_History , 
         gender ,
         is_Paid:true ,
         invoice_number ,
         company ,
         orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , final_amount}})=>({
            test:test ,
            price:price ,
            priceAfterDiscount:priceAfterDiscount ,
            final_amount
         })) ,
         shipping_Address:{
            street: street ,
            city: city ,
         } ,
      })
      
      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(order.patient_Name) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf`} , {new:true})
      
      //! Create Invoice Pdf  orders :
      try {
         await create_pdf(pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
      } catch (error) {
         return next(new AppError(error.message, 500));
         // return next(new AppError("Invoice PDF creation failed", 500));
      }

      //! Delete Cart After Create Order:
      const cartDeleted = await cartModel.findByIdAndDelete(cart._id , {new:true}) ;

      //& Increase the number of times the test is done : 
      const options =  order.orderItems.map(({test:{_id }})=>({
         updateOne:{
            filter:{_id} ,
            update:{$inc:{count:1}}
         }
      }));
      await testModel.bulkWrite(options);

      if(!order) return next(new AppError("Order Failed", 400)) ;
      res.json({message:"success", add_Invoice_Order, patient:req.patient});
   }
)











//& Create Cash Order Logged User Or Old User :
// export const createCashOrderLoggedUser = catchError(
//    async(req , res , next)=>{
//       const {patient_Name  , patient_Age  , gender , address:{street , city} , patient_Phone , doctor_Name , patient_History } = req.patient ;
//       const { branch } = req.body ;
//       const cart = await cartModel.findOne({user:req.user._id}) ;
//       if(!cart) return next(new AppError("Cart Not Found" , 404)) ;

//       const company = cart.cartItems[0].price.company ;
//       const invoice_number = invoice_nanoid() ;
   
//       const order = await orderModel.create({
//          user:req.user._id ,
//          patient_Name , 
//          patient_Age , 
//          doctor_Name , 
//          cart:cart._id ,
//          patient_Phone ,
//          patient_History , 
//          gender ,
//          invoice_number ,
//          company ,
//          orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , final_amount}})=>({
//             test:test ,
//             price:price ,
//             priceAfterDiscount:priceAfterDiscount ,
//             final_amount
//          })) ,
//          branch_Area: branch ,
//          shipping_Address:{
//             street: street ,
//             city: city ,
//          } ,
//          createdAtOrder : new Date().getTime()
//       })
      
//       //! Added invoice to this Order :
//       const patient_Name_Slug = slugify(order.patient_Name) ;
//       const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` } , {new:true})
      
//       //! Create Invoice Pdf  orders :
//       create_pdf(res , pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
      

//       //!Delete Cart After Create Order:
//       const cartDeleted = await cartModel.findByIdAndDelete(cart._id , {new:true})  ; 

//       //& Increase the number of times the test is done : 
//       const options =  order.orderItems.map(({test:{_id }})=>{
//          return (
//             {
//                updateOne:{
//                   filter:{_id} ,
//                   update:{$inc:{count:1}}
//                }
//             }
//          )
//       })
//       await testModel.bulkWrite(options)


      
//       if(!order) return next(new AppError("Order Failed" , 400)) ;
//       res.json({message:"success" , add_Invoice_Order , patient:req.patient})
//    }
// )


//& Check Patient Exist MiddleWare :
export const checkExistPatientMiddleWare = catchError(
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









//& Change Wrong Invoice True Or False :
export const addHouseCall = catchError(
   async(req , res , next)=>{
      const {isHouse_Call } = req.query ;
      const {id} = req.params ;

      const order = await orderModel.findById(id) ;
      if(!order) return next(new AppError("Order Not Found" , 404)) ;

      if(isHouse_Call){
         order.isHouse_Call = isHouse_Call;
         await order.save() ;
      }
      res.json({message:"success" })
   }
)




//& Cancel Order :
export const cancelOrder = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const {message} = req.body ;

      const order = await orderModel.findById(id) ;
      if(!order) return next(new AppError("Order Not Found" , 404)) ;

      if(!order.is_Cancel)  {
         order.invoice_number = null ;
         order.transform_number = null ;
         order.is_Cancel = true ;
         order.cancel_At = Date.now()
         order.message = message ;
         await order.save() ;
      }else{
         return next(new AppError("Order Already Canceled" , 404)) ;
      }


      // 1- Deleted Invoice Pdf
      // 2- Deleted transform Pdf

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




//& Generate Invoice Order manually :
export const generateInvoiceOrder = catchError(
   async(req , res , next)=>{

      const {order_Number} = req.query;

      const order =  await orderModel.findOne({order_Number})
      // const order =  await orderModel.findById(id)
      if(!order) return next(new AppError("Order Not Exist" , 404));

      
      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(order.patient_Name) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` } , {new:true})
      
      //! Create Invoice Pdf  orders :
      create_pdf(pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
      
      res.json({message:" Generate Invoice Cash Order successfully"})
   }
)



//& Delete Order :
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

      }else{
         return next(new AppError("Order Not Exist" , 404)) ;
      }
      res.json({message:"success" })
   }
)








//^================================== Create Online Order And Payment With Paymob  ==================================


const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY ;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID ;
let authToken = "" ;


//& 1- Create Token In Paymob :
const getAuthToken = async () => {
   try {
      const response = await axios.post("https://accept.paymob.com/api/auth/tokens", {
         api_key: PAYMOB_API_KEY,
      });
      authToken = response.data.token;
   } catch (error) {
      console.error("Error getting auth token:", error.response?.data || error.message);
   }
};

//& 2- Create Payment Method :
export const createSession = async (req , res , next) => {
   try {
      await getAuthToken();

      const {patient_Name  , gender , street , city ,  patient_Phone , doctor_Name , patient_History} = req.body ;

      const cart = await cartModel.findOne({user:req.user._id}) ;
      if(!cart) return next(new AppError("Cart Not Found" , 404)) ;

      // const phone = req.user.phone ;
      const amount_num = cart.total_After_Discount ; 
      const amount = Math.round(amount_num) * 100 ; 


      const orderData = {
         user: req.user._id , 
         patient_Name , 
         patient_Age: req.patient.patient_Age , 
         gender , 
         street , 
         city , 
         patient_Phone , 
         doctor_Name , 
         patient_History ,
      } ;


      // تحويل المبلغ إلى قروش (100 جنيه = 10000 قرش)
      const orderResponse = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
         auth_token: authToken,
         delivery_needed: "false",
         amount_cents: amount ,
         currency: "EGP",
         merchant_order_id: new Date().getTime(),
         items: [],
      });
      const orderId = orderResponse.data.id;

      // طلب Payment Key
      const paymentKeyResponse = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
         auth_token: authToken,
         amount_cents: amount ,
         expiration: 3600,
         order_id: orderId,
         extra:orderData ,
         billing_data: {
            phone_number: patient_Phone ,
            first_name: "mahmoud" ,
            last_name: "osman" ,
            email: "email@example.com" ,
            country: "EG",
            city: "Cairo",
            state: "Cairo", 
            street: "123 Street",
            building: "1",
            apartment: "1",
            floor: "1",
         },
         currency: "EGP",
         integration_id: PAYMOB_INTEGRATION_ID ,
      });

      const paymentKey = paymentKeyResponse.data.token ;
      res.json({
         redirect_url: `https://accept.paymob.com/api/acceptance/iframes/865137?payment_token=${paymentKey}`,
      });

   } catch (error) {
      // console.error("Error creating payment:", error);
      console.error("Error Payment creation failed !", error.response?.data || error.message);
      res.status(500).json({ error: "Payment creation failed !" });
   }
};

//& 3- Receive Webhook From Paymob :
export const webhookMiddleWre = catchError(
   async(req , res , next)=>{
      const {success , pending , amount_cents , data , order , payment_key_claims} = req.body.obj ;  // البيانات اللي جاية من PayMob
         console.log("Done Webhook");
         console.log("Success" , success);
         console.log("Pending" , pending);
         // console.log("order_url" , order.order_url);
         // console.log(req.body.obj);
         console.log("Extra ==>" , payment_key_claims.extra);
         
      if (success) {
         createOnlineOrder(payment_key_claims.extra)
         console.log(`💰 Successfully Payment Message : ${data.message} ${amount_cents / 100} EGP`);
      } else {
         console.log(`❌ Failed Payment Message : ${data.message}`);
      }
   }
)

//& 4- Create Online Order :
export const createOnlineOrder = async (data)=>{
   const{
      user , 
      patient_Name , 
      patient_Age , 
      doctor_Name , 
      patient_Phone , 
      patient_History , 
      gender , 
      street , 
      city 
   } = data ;

   const cart = await cartModel.findOne({user:user}) ;
   
   const company = cart.cartItems[0].price.company ;
   const invoice_number = invoice_nanoid() ;
   const order_Number = await getNextOrderNumber() ;

   const order = await orderModel.create({
      order_Number ,
      user:user ,
      patient_Name ,
      patient_Age , 
      doctor_Name , 
      cart:cart._id ,
      patient_Phone ,
      patient_History , 
      gender ,
      invoice_number ,
      is_Paid : true ,
      company ,
      orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , final_amount}})=>({
         test:test ,
         price:price ,
         priceAfterDiscount:priceAfterDiscount ,
         final_amount
      })) ,
      shipping_Address:{
         street: street ,
         city: city ,
      } ,
   })

   //! Added invoice to this Order :
   const patient_Name_Slug = slugify(`${order.patient_Name}`) ;
   const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` } , {new:true})
   
   //! Create Invoice Pdf  orders :
   try {
      await create_pdf(pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
   } catch (error) {
      console.error('Invoice PDF creation failed', error.response?.data || error.message);
   }

   //!Delete Cart After Create Order:
   const cartDeleted = await cartModel.findByIdAndDelete(cart._id , {new:true})  ; 

   //& Increase the number of times the test is done : 
   const options =  order.orderItems.map(({test:{_id }})=>({
      updateOne:{
         filter:{_id} ,
         update:{$inc:{count:1}}
      }
   }));
   await testModel.bulkWrite(options);

   console.log("Successfully Created New Orders By Paymob Online!");
   console.log("Done" , add_Invoice_Order);
}




// https://paymob-method.vercel.app/webhook   

// Mastercard Approved :
// 5123456789012346
// Test Account
// 12/25
// 123





