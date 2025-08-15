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
import { getDateRange } from "../../services/getDateRange.js";
import { priceModel } from "../../../DataBase/models/price.model.js";
import { pdf_transform } from "../../templates/pdf.transform.js";
env.config() ;


const alphabet = process.env.INVOICE_NUMBER || '123456789';
const invoice_nanoid = customAlphabet(alphabet , 10) ;


const alphabetTransform = process.env.TRANSFORM_NUMBER || '012345678';
const transform_nanoid = customAlphabet(alphabetTransform , 10) ;






//& Get All order :
export const getAllOrder = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      let result = await orderModel.find();

      //^ Merge Params
      let filterObj = {};  

      //& Return all orders during the current month :
      const start = getDateRange().currentMonth.start // get all order in month range first day to end day   1 - 31
      const end = getDateRange().currentMonth.end



      //^ Filter By Order Type :
      if (filter == "sampling"){
         filterObj = {is_Approved :true , is_Paid :true , is_Cancel:false  }
      }else if (filter == "cancel"){
         filterObj = {is_Cancel:true}
      }else if (filter == "cash"){
         filterObj = {payment_Type:"cash"}
      }else if (filter == "card"){
         filterObj = {payment_Type:"card"}
      }else if (filter == "new"){
         filterObj = {   
            createdAtOrder: {
               $gte: start,
               $lte: end
            }
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

      //& Get Range Month :
      const startMonth = getDateRange().currentMonth.start
      const endMonth = getDateRange().currentMonth.end


      //! Get All Payment Online and Cash  Orders Monthly :
      const paymentOrder = await orderModel.find({ 
         is_Paid :true   ,
         is_Cancel:false , 
         is_Approved :true   , 
         createdAtOrder: {
            $gte: startMonth,
            $lte: endMonth
         }
      });







      //! Get All Payment Cash Orders Today's :
      const paymentCashOrder = await orderModel.find({ 
         is_Paid :true   ,
         is_Cancel:false , 
         is_Approved :true   , 
         payment_Type :"cash"   , 
         createdAtOrder: {
            $gte: start,
            $lte: end
         }
      });
      const Net_Amount_Cash = paymentCashOrder.reduce((acc , order)=>{
         return acc + order.Net_Amount
      } , 0) ;
      const finishProfitsCash = Net_Amount_Cash ;







      //! Get All Payment Online Orders Today's :
      const paymentOnlineOrder = await orderModel.find({ 
         is_Paid :true   ,
         is_Cancel:false , 
         is_Approved :true   , 
         payment_Type :"card"   , 
         createdAtOrder: {
            $gte: start,
            $lte: end
         }
      });
      const Net_Amount_Online = paymentOnlineOrder.reduce((acc , order)=>{
         return acc + order.Net_Amount
      } , 0) ;
      const finishProfitsOnline = Net_Amount_Online ;







      //! Get All Payment Online Orders Monthly :
      const paymentOnlineOrderMonthly = await orderModel.find({ 
         is_Paid :true   ,
         is_Cancel:false , 
         is_Approved :true   , 
         payment_Type :"card"   , 
         createdAtOrder: {
            $gte: startMonth,
            $lte: endMonth
         }
      });
      const Net_Amount_Online_Monthly = paymentOnlineOrderMonthly.reduce((acc , order)=>{
         return acc + order.Net_Amount
      } , 0) ;
      const finishProfitsOnlineMonthly = Net_Amount_Online_Monthly ;





      //! Get All Payment Cash Orders Monthly :
      const paymentCashOrderMonthly = await orderModel.find({ 
         is_Paid :true   ,
         is_Cancel:false , 
         is_Approved :true   , 
         payment_Type :"cash"   , 
         createdAtOrder: {
            $gte: startMonth,
            $lte: endMonth
         }
      });
      const Net_Amount_Cash_Monthly = paymentCashOrderMonthly.reduce((acc , order)=>{
         return acc + order.Net_Amount
      } , 0) ;
      const finishProfitsCashMonthly = Net_Amount_Cash_Monthly ;




      res.json({message:"success" , Order_Data :{
         cancel_Order:{count:cancelOrder.length , cancelOrder} ,
         approvedOrder:{count:approvedOrder.length , approvedOrder} ,
         executed_Order:{count:executedOrder.length , executedOrder} ,
         new_Order:{count:paymentOrder.length , paymentOrder} ,
         finish_Profits_Online:finishProfitsOnline ,
         finish_Profits_Cash:finishProfitsCash ,
         finish_Profits_Cash_Monthly:finishProfitsCashMonthly ,
         finish_Profits_Online_Monthly:finishProfitsOnlineMonthly
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




//*============================================ Cash Order ============================================== 

//& Create Cash Order Logged User Or Old User :
export const createCashOrder = catchError(
   async(req , res , next)=>{

      const {patient_Name, patient_Age, gender, patient_Phone , birthDay} = req.patient ;
      const cart = await cartModel.findOne({user:req.user._id}) ;
      if(!cart) return next(new AppError("Cart Not Found", 404)) ;

      const company = cart.cartItems[0].price.company ;
      const invoice_number = invoice_nanoid() ;
      const order_Number = await getNextOrderNumber() ;

      const order = await orderModel.create({
         order_Number ,
         user:req.user._id ,
         patient_Name , 
         birthDay ,
         patient_Age , 
         cart:cart._id ,
         patient_Phone ,
         gender ,
         is_Paid:true ,
         invoice_number ,
         company ,
         orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , contract_Price}})=>({
            test:test ,
            price:price ,
            priceAfterDiscount:priceAfterDiscount ,
            contract_Price
         }))
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
      // const cartDeleted = await cartModel.findByIdAndDelete(cart._id , {new:true}) ;

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



//*============================================Create Cash Order By instaPay ============================================== 
export const createCashOrderByInstaPay = catchError(
   async(req , res , next)=>{

      const {patient_Name , patient_Age , gender , patient_Phone , birthDay} = req.patient ;
      const {listIdTest ,  companyId} = req.body ;
      
      let priceList = [] ;
      for (const element of listIdTest) {
         const priceTestExist = await priceModel.findOne({test:element , company:companyId}) ;
         if(!priceTestExist)  return next(new AppError(`Price Test Not Found in This Company` , 404)) ;
         priceList.push(priceTestExist)
      }
      let cartItems = priceList.map((price)=>{
         return {
               test:price.test ,
               price:price
            }
      })
      

      //^ Delete Cart Admin :
      await cartModel.findOneAndDelete({user:req.user._id }) ;


      const cart = new cartModel({
         user:req.user._id ,
         company :companyId ,
         cartItems
      })
      await cart.save() ;




      const company = companyId ;
      const invoice_number = invoice_nanoid() ;
      const transform_number =  transform_nanoid();
      const order_Number = await getNextOrderNumber() ;

      const order = await orderModel.create({
         order_Number ,
         user:req.user._id ,
         patient_Name , 
         birthDay ,
         patient_Age , 
         patient_Phone ,
         gender ,
         payment_Type:"cash" ,
         is_Paid:false ,
         invoice_number ,
         is_Approved: false ,
         approved_At: Date.now() ,
         transform_number ,
         company ,
         orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , contract_Price}})=>({
            test:test ,
            price:price ,
            priceAfterDiscount:priceAfterDiscount ,
            contract_Price
         }))
      })

      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(order.patient_Name) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , 
         {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` ,
         transform_pdf : `transform_${patient_Name_Slug}_${order._id}.pdf` ,
      } , {new:true}) ;

      //! Create Invoice Pdf  orders :
      try {
         await create_pdf(pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
         await create_pdf(pdf_transform , add_Invoice_Order , `transform_${patient_Name_Slug}_${order._id}`);
      } catch (error) {
         return next(new AppError(error.message, 500));
      }


      //! Delete Cart After Create Order:
      await cartModel.findByIdAndDelete(cart._id , {new:true}) ;

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






//& Check Patient Exist MiddleWare :
export const checkExistPatientMiddleWare = catchError(
   async(req , res , next)=>{
      const {patient_Name , birthDay , gender  , patient_Phone} = req.body ;

      const createdBy = req.user._id ;
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
            patient_Phone , 
            createdBy
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
            patient_Phone ,
            createdBy 
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





//& Paid Order By Admin :
export const paidOrderByAdmin = catchError(
   async(req , res , next)=>{
      const {is_Paid , orderId} = req.body ;
      
      const order = await orderModel.findById(orderId) ;
      if(!order) return next(new AppError("Order Not Exist" , 404)) ;

      if(is_Paid){
         order.is_Paid = is_Paid;
         await order.save() ;
      }
      res.json({message:`${order.is_Paid? "The order has been paid successfully. !" : "Failed, The order has not been paid."}` })
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







//& Delete Order Media :
export const deleteOrderMedia = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const order = await orderModel.findById(id) ;

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








//^================================== Providing statistics for the graph in the admin for sales orders  =============
export const salesLastMonth = catchError(
   async (req, res) => {

      // const time = getDateRange() ;

      // const salesPerMonth = await orderModel.aggregate([
      //    {
      //       $match: { is_Paid: true } // نفلتر الطلبات المدفوعة فقط
      //    } ,
      //    {
      //       $group: {
      //          _id: { $month: "$createdAt" } ,
      //          // _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      //          total_After_Sales: { $sum: "$total_Price_After_Discount" }
      //       }
      //    },
      //    {
      //       $sort: { _id: 1 }
      //    }
      // ]);


      // const sevenDaysAgo = new Date() ;
      //    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) ; // 6 عشان اليوم الحالي كمان
      // const sales = await orderModel.aggregate([
      //    {
      //    $match: {
      //       createdAt: { $gte: sevenDaysAgo }
      //    }
      //    },
      //    {
      //    $group: {
      //       _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      //       totalSales: { $sum: "$total_Price_After_Discount" }
      //    }
      //    },
      //    { $sort: { _id: 1 } }
      // ]);

      // res.json({message:"success" , salesPerMonth})


      // const result = await orderModel.aggregate([
      //    {
      //       $lookup: {
      //          from: 'companies',
      //          localField: 'company',
      //          foreignField: '_id',
      //          as: 'company'
      //       }
      //    },
      //    // { $unwind: '$company' },
      //    { $match: { 'company.name': 'almokhtabar' } },
      //    { $limit: 1 }
      // ]);


      // const result = await orderModel.aggregate([
      //    {
      //       $group: {
      //          _id: "$company",        // تجميع حسب الشركة
      //          totalSales: { $sum: "$total_Price_After_Discount" },  // جمع الإجمالي من جميع الطلبات لكل شركة
      //          orderCount: { $count: {} }  // عد عدد الطلبات
      //       }
      //    }
      // ]);

      const time = getDateRange() ;
      const from = time.currentMonth.start ;
      const to = time.currentMonth.end ;


      // const result = await orderModel.aggregate([
      //    //! Filter Order By time And Total Price :
      //    {
      //       $match: {
      //          createdAtOrder: { $gte: from, $lte: to } ,
      //          total_Price_After_Discount:{$gte:200}
      //       }
      //    },

      //    //! Create Group Order By Company id :
      //    {
      //       $group: {
      //          _id: "$company", // تجميع حسب الشركة
      //          // _id: "$user", // تجميع حسب المستخدم
      //          total_Sales: { $sum: "$total_Price_After_Discount" }, // جمع الإجمالي من جميع الطلبات لكل شركة
      //          orderCount: { $count: {} } , // عد عدد الطلبات
      //       }
      //    },

      //    //! Sort  By Total and Return Company  :
      //    // { $sort: { totalSales: -1 } }, // ترتيب تنازلي
      //    // { $sort: { totalSales: 1 } }, // ترتيب تصاعدى
      //    // { $limit: 1 },

      //    //! Create Populate On Company id  And Create New Field companyDetails to Company :
      //    {
      //       $lookup: {
      //          from: "companies", //  (collection)  اسم المجموعة الخاصة بالشركات 
      //          // from: "users", //(collection)  اسم المجموعة الخاصة بالمستخدمين 
      //          localField: "_id",  // الحقل الذي نستخدمه للربط (هو الـ _id للشركة هنا)
      //          foreignField: "_id", // الحقل الذي سنربط به في مجموعة الشركات
      //          as: "companyDetails" // الإسم الجديد للمصفوفة التي تحتوي على تفاصيل الشركة
      //          // as: "userDetails" // الإسم الجديد للمصفوفة التي تحتوي على تفاصيل المستخدم
      //       }
      //    },

      //    //! Get Separator Company Only :
      //    {
      //       $unwind: "$companyDetails" // لتفكيك المصفوفة وإرجاع كل شركة ككائن منفصل
      //       // $unwind: "$userDetails" // لتفكيك المصفوفة وإرجاع كل مستخدم ككائن منفصل
      //    },

      //    //! Create Finish Response Shape and add new Field  :
      //    {
      //       $project: {
      //          _id: 0, // 👈 هذا يخفي الـ _id من النتيجة
      //          companyName: "$companyDetails.name", // إرجاع اسم الشركة فقط
      //          // companyName: "$userDetails.name", // إرجاع اسم المستخدم فقط
      //          total_Sales: 1, // الإجمالي
      //          orderCount: 1 ,// عدد الطلبات
      //          totalAfterTax: { $multiply: ["$total_Sales", 1.14] } // ضرب المجموع في 14% ضريبة مثلاً
      //       }
      //    }
      // ]);

      const result = await orderModel.aggregate([
         //! Filter Order By time And Total Price :
         {
            $match: {
               createdAtOrder: { $gte: from, $lte: to } ,
               total_Price_After_Discount:{$gte:200}
            }
         },

         //! Create Group Order By Company id :
         {
            $group: {
               _id: "$company", // تجميع حسب الشركة
               // _id: "$user", // تجميع حسب المستخدم
               total_Sales: { $sum: "$total_Price_After_Discount" }, // جمع الإجمالي من جميع الطلبات لكل شركة
               orderCount: { $count: {} } , // عد عدد الطلبات
            }
         },

         //! Sort  By Total and Return Company  :
         // { $sort: { totalSales: -1 } }, // ترتيب تنازلي
         // { $sort: { totalSales: 1 } }, // ترتيب تصاعدى
         // { $limit: 1 },

         //! Create Populate On Company id  And Create New Field companyDetails to Company :
         {
            $lookup: {
               from: "companies", //  (collection)  اسم المجموعة الخاصة بالشركات 
               // from: "users", //(collection)  اسم المجموعة الخاصة بالمستخدمين 
               localField: "_id",  // الحقل الذي نستخدمه للربط (هو الـ _id للشركة هنا)
               foreignField: "_id", // الحقل الذي سنربط به في مجموعة الشركات
               as: "companyDetails" // الإسم الجديد للمصفوفة التي تحتوي على تفاصيل الشركة
               // as: "userDetails" // الإسم الجديد للمصفوفة التي تحتوي على تفاصيل المستخدم
            }
         },

         //! Get Separator Company Only :
         {
            $unwind: "$companyDetails" // لتفكيك المصفوفة وإرجاع كل شركة ككائن منفصل
            // $unwind: "$userDetails" // لتفكيك المصفوفة وإرجاع كل مستخدم ككائن منفصل
         },

         //! Create Finish Response Shape and add new Field  :
         {
            $project: {
               _id: 0, // 👈 هذا يخفي الـ _id من النتيجة
               companyName: "$companyDetails.name", // إرجاع اسم الشركة فقط
               // companyName: "$userDetails.name", // إرجاع اسم المستخدم فقط
               total_Sales: 1, // الإجمالي
               orderCount: 1 ,// عدد الطلبات
               totalAfterTax: { $multiply: ["$total_Sales", 1.14] } // ضرب المجموع في 14% ضريبة مثلاً
            }
         }
      ]);



         const monthlyIncome = await orderModel.aggregate([
            {
               $match: {
                  createdAtOrder: { $gte: from, $lte: to },
                  is_Paid: true
               }
            },
            {
               $project: {
                  numberOfTests: { $size: "$orderItems" },
                  total_After_Sales: { $ifNull: ["$total_Price_After_Discount", 0] },
                  createdAt: { $toDate: "$createdAtOrder" }
               }
            },
            {
               $group: {
                  _id: { $month: "$createdAt" },
                  total_Sales: { $sum: "$total_After_Sales" },
                  order_count: { $sum: 1 },
                  totalTests: { $sum: "$numberOfTests" }
               }
            },
            {
               $addFields: {
                  target: 20000,
                  achievementPercent: {
                     $cond: [
                        { $gt: [20000, 0] },
                        { $round: [{ $multiply: [{ $divide: ["$total_Sales", 20000] }, 100] }, 2] },
                        0
                     ]
                  } ,
                  testTarget: 500 ,
                  achievementPercentTest: {
                     $cond: [
                        { $gt: [500, 0] },
                        { $round: [{ $multiply: [{ $divide: ["$totalTests", 500] }, 100] }, 2] },
                        0
                     ]
                  }
               }
            } 
         ]);
         
      
      
      
      res.json({message:"success" , monthlyIncome  , result})
});







//^================================== Create Cash Order By Admin   ==================================
//& Create Cash Order Logged User Or Old User :
export const createCashOrderByAdmin = catchError(
   async(req , res , next)=>{

      const {patient_Name , patient_Age , gender , patient_Phone , birthDay} = req.patient ;
      const {listIdTest ,  companyId} = req.body ;
      
      let priceList = [] ;
      for (const element of listIdTest) {
         const priceTestExist = await priceModel.findOne({test:element , company:companyId}) ;
         if(!priceTestExist)  return next(new AppError(`Price Test Not Found in This Company` , 404)) ;
         priceList.push(priceTestExist)
      }
      let cartItems = priceList.map((price)=>{
         return {
               test:price.test ,
               price:price
            }
      })
      

      //^ Delete Cart Admin :
      await cartModel.findOneAndDelete({user:req.user._id }) ;


      const cart = new cartModel({
         user:req.user._id ,
         company :companyId ,
         cartItems
      })
      await cart.save() ;




      const company = companyId ;
      const invoice_number = invoice_nanoid() ;
      const transform_number =  transform_nanoid();
      const order_Number = await getNextOrderNumber() ;

      const order = await orderModel.create({
         order_Number ,
         user:req.user._id ,
         patient_Name , 
         birthDay ,
         patient_Age , 
         patient_Phone ,
         gender ,
         payment_Type:"cash" ,
         is_Paid:true ,
         invoice_number ,
         is_Approved: true ,
         approved_At: Date.now() ,
         transform_number ,
         company ,
         orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , contract_Price}})=>({
            test:test ,
            price:price ,
            priceAfterDiscount:priceAfterDiscount ,
            contract_Price
         }))
      })

      //! Added invoice to this Order :
      const patient_Name_Slug = slugify(order.patient_Name) ;
      const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , 
         {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` ,
         transform_pdf : `transform_${patient_Name_Slug}_${order._id}.pdf` ,
      } , {new:true}) ;

      //! Create Invoice Pdf  orders :
      try {
         await create_pdf(pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
         await create_pdf(pdf_transform , add_Invoice_Order , `transform_${patient_Name_Slug}_${order._id}`);
      } catch (error) {
         return next(new AppError(error.message, 500));
         // return next(new AppError("Invoice PDF creation failed", 500));
      }


      //! Delete Cart After Create Order:
      await cartModel.findByIdAndDelete(cart._id , {new:true}) ;

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










//^================================== Create Online Order And Payment With Paymob  ==================================
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY ;
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
      await getAuthToken() ;


      const {patient_Name  , gender , birthDay,  patient_Phone , patient_Age} = req.patient ;
      const {payment , profile} = req.query;

      let integration_id = "" ;
      if(payment === "credit"){
         integration_id = "5195748" ;
      }else if(payment === "wallet"){
         integration_id = "5195747" ;
      };



      const cart = await cartModel.findOne({user:req.user._id}) ;
      if(!cart) return next(new AppError("Cart Not Found" , 404)) ;

      const amount_num = cart.total_After_Discount ; 
      let amount ;  


      //^ Check Order Type if Tests Or Profiles :
      if(profile === "true"){
         if(!cart.profilePrice) return next(new AppError("Profile Price Not Exist" , 404)) ;
         amount = Math.round(cart.profilePrice) * 100  ;
      }else{
         amount = Math.round(amount_num) * 100 ; 
      }


      const orderData = {
         user: req.user._id , 
         patient_Name :patient_Name , 
         patient_Age ,
         gender ,  
         patient_Phone , 
         birthDay , 
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
            first_name: "Example" ,
            last_name: "Example" ,
            email: "email@example.com" ,
            country: "EG",
            city: "......",
            state: "......", 
            street: "......",
            building: "1",
            apartment: "1",
            floor: "1",
         },
         currency: "EGP",
         integration_id ,
      });

      const paymentKey = paymentKeyResponse.data.token ;
      
      res.json({
         redirect_url: `https://accept.paymob.com/api/acceptance/iframes/931835?payment_token=${paymentKey}`,
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
         console.log(`💰 Successfully Payment Message`);
         await createOnlineOrder(payment_key_claims.extra)
         console.log(`💰 Successfully Payment Message : ${data.message} ${amount_cents / 100} EGP`);
      } else {
         console.log(`❌ Failed Payment Message : ${data.message}`);
         return next(new AppError(`❌ Failed Payment Message : ${data.message}` , 401)) ;
      }
   }
)
//& 4- Create Online Order :
export const createOnlineOrder = async (data)=>{
   const{
      user , 
      patient_Name , 
      patient_Age , 
      patient_Phone , 
      gender , 
      birthDay
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
      cart:cart._id ,
      patient_Phone ,
      birthDay , 
      gender ,
      invoice_number ,
      is_Paid : true ,
      payment_Type:"card" ,
      company ,
      orderItems:cart.cartItems.map(({test , price:{price , priceAfterDiscount , contract_Price}})=>({
         test:test ,
         price:price ,
         priceAfterDiscount:priceAfterDiscount ,
         contract_Price
      })) ,
   })

   //! Added invoice to this Order :
   const patient_Name_Slug = slugify(`${order.patient_Name}`) ;
   const add_Invoice_Order = await orderModel.findByIdAndUpdate(order._id , {invoice_pdf  : `invoice_${patient_Name_Slug}_${order._id}.pdf` } , {new:true})
   
   //! Create Invoice Pdf  orders :
   try {
      await create_pdf(pdf_invoice , add_Invoice_Order , `invoice_${patient_Name_Slug}_${order._id}`);
   } catch (error) {
      console.error('Invoice PDF creation failed', error.response?.data || error.message);
      return next(new AppError("Invoice PDF creation failed" , 404)) ;
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
   
   res.json({message:"Successfully Created New Orders By Paymob Online!" , order:add_Invoice_Order})
}




// https://paymob-method.vercel.app/webhook   

// Mastercard Approved :
// 5123456789012346
// Test Account
// 12/25
// 123




// ${new Date(data.approved_At).toISOString().split('T')[0] }