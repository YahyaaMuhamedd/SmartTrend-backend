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
env.config()


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
            // is_Paid_Invoice_V_Cash :true  ,   
            // is_wrong_Invoice_V_Cash :false ,   
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
      const day = (date.getDate()).toString().length == 1 ? `0${(date.getDate() + 1)}` :  (date.getDate() ) ;
      const month = (date.getMonth()).toString().length == 1 ? `0${(date.getMonth() + 1)}` :  (date.getMonth()) ;
      const year = date.getFullYear() ;

      const todayDate = new Date(`${year}-${month}-${day}T00:00:00Z`) ;

      // const todayDate = `${year}-${month}-${day}T00:00:00Z` ;
      const end = `${year}-${month}-${day}T24:00:00.000+00:00`  ;

      //! Get All Payment Orders Today's :
      const paymentOrder = await orderModel.find({
         // is_Paid_Invoice_V_Cash :true  ,   
         is_Paid :true   , 
         is_Done :true   , 
         createdAt:
            {
               $gt: todayDate
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

      const {patient_Name, patient_Age, gender, address:{street, city}, patient_Phone, doctor_Name, patient_History } = req.patient ;
      const cart = await cartModel.findOne({user:req.user._id}) ;
      if(!cart) return next(new AppError("Cart Not Found", 404)) ;

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
         shipping_Address:{
            street: street ,
            city: city ,
         } ,
         createdAtOrder : new Date().getTime()
      })
      
      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(order.patient_Name) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf`} , {new:true})
      
      //! Create Invoice Pdf  orders :
      try {
         await create_pdf(pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
      } catch (error) {
         return next(new AppError("Invoice PDF creation failed", 500));
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











// //& Create Cash Order Logged User Or Old User :
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



//& Rejected Cash Order :
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








//^================================== Create Online Order And Payment With Paymob  ==================================


const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
let authToken = "";


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
export const create_payment = async (req , res , next) => {
   try {
      await getAuthToken();

      const {patient_Name  , gender , street , city ,  patient_Phone , doctor_Name , patient_History} = req.body ;

      const cart = await cartModel.findOne({user:req.user._id}) ;
      if(!cart) return next(new AppError("Cart Not Found" , 404)) ;

      const phone = req.user.phone ;
      const amount = parseInt(cart.total_After_Discount * 100) ;

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
         // amount_cents: amount ,
         amount_cents: amount ,
         currency: "EGP",
         merchant_order_id: new Date().getTime(),
         items: [],
      });
      const orderId = orderResponse.data.id;

      // طلب Payment Key
      const paymentKeyResponse = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
         auth_token: authToken,
         // amount_cents: amount * 100,
         amount_cents: amount ,
         expiration: 3600,
         order_id: orderId,
         extra:orderData ,
         billing_data: {
            phone_number: phone ,
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
      console.error('Error creating order:', error.response?.data || error.message);
      res.status(500).json({ error: "Payment creation failed" });
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
   console.log("Order Successfully"  , data)
   const{
      user , 
      patient_Name , 
      patient_Age , 
      doctor_Name , 
      patient_Phone , 
      patient_History , 
      gender , 
      branch_Area , 
      street , 
      city
   } = data ;

      const cart = await cartModel.findOne({user:user}) ;
      if(!cart) return next(new AppError("Cart Not Found" , 404)) ;

      const company = cart.cartItems[0].price.company ;
      const invoice_number = invoice_nanoid() ;
   
      const order = await orderModel.create({
         user:user ,
         patient_Name ,
         branch_Area , 
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
         shipping_Address:{
            street: street ,
            city: city ,
         } ,
      })

      console.log("Order @@@==>" , order);
      
      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(`${order.patient_Name}`) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` } , {new:true})
      
      //! Create Invoice Pdf  orders :
      let pdf = create_pdf(res , pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);



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

      console.log("Successfully Created New Orders By Paymob Online!");
      console.log("Done" , add_Invoice_Order);
}




// https://paymob-method.vercel.app/webhook   

// Mastercard Approved :
// 5123456789012346
// Test Account
// 12/25
// 123





