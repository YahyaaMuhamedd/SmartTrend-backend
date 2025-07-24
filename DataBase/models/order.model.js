import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   order_Number:{
      type:String ,
      unique:[true , "Order Order Number is Unique"]
   } , 
   user:{
      type:Types.ObjectId , 
      ref:"user"  ,
   } ,
   company:{
      type:Types.ObjectId , 
      ref:"company"  ,
   } ,
   patient_Name :{
      type:String ,
      required:true
   } , 
   patient_Phone :{
      type:String
   } , 
   patient_Age :{
      type:Number
   } , 
   birthDay:{
      type:Date , 
      required : true ,
   } ,
   gender:{
      type:String ,
      enum :["male" , "female"] ,
      default:"male"
   } ,
   invoice_pdf:String ,
   transform_pdf:String ,
   orderItems:[
      {
         test:{
            type:Types.ObjectId , 
            ref:"test" 
         } ,
         price:{
            type:Number
         }  ,
         priceAfterDiscount:{
            type:Number
         }  ,
         contract_Price:{
            type:Number
         }  ,
      }
   ] ,
   createdAtOrder:{
      type:Number
   }  ,
   message:{
      type:String ,
      default:"" ,
   } ,
   branch:{
      type:Types.ObjectId , 
      ref:"branch"  ,
   } ,
   payment_Type:{
      type:String ,
      enum:["cash" , "card"] ,
      default:"card" ,
   } ,
   invoice_number:{
      type:Number ,
   } ,
   total_Price:{
      type:Number ,
   } ,
   total_Price_After_Discount:{
      type:Number ,
   } ,
   Net_Amount:{
      type:Number ,
   } ,
   Contract_Price:{
      type:Number ,
   } ,
   transform_number:{
      type:Number ,
   } ,
   // invoiceExpiryDate: Date ,
   invoiceExpiryDate: Number ,
   isHouse_Call:{
      type:Boolean ,
      default:false
   } ,
   is_Paid:{
      type:Boolean ,
      default:false
   } ,
   is_Cancel:{
      type:Boolean ,
      default:false
   } ,
   // cancel_At:Number , // Return MilliSecond Format
   cancel_At:Date ,      // Return Date Time Format 
   is_Approved:{
      type:Boolean ,
      default:false
   } ,
   approved_At:Date ,
} , { timestamps:true , toJSON:{virtuals:true} , toObject:{virtuals:true} } )



//& Added Dynamic Creation Time At :
schema.pre("save"  , function(next){   
   if (!this.createdAtOrder) {
      this.createdAtOrder = Date.now() ;
   }
   if (!this.invoiceExpiryDate) {
      const expiry = new Date(this.createdAt || Date.now());
      expiry.setDate(expiry.getDate() + 30);
      this.invoiceExpiryDate = expiry;
   }



   //& Calculate Total Price , Total Price After Discount and Net_Amount :
   this.total_Price = Math.round(this.orderItems.reduce((acc, entry) => acc + entry.price, 0)) ;
   this.Contract_Price = Math.round(this.orderItems.reduce((acc, entry) => acc + entry.contract_Price, 0)) ;
   // this.Net_Amount = Math.round(this.Contract_Price - this.priceAfterDiscount) ;
   this.total_Price_After_Discount = Math.round(this.orderItems.reduce((acc, entry) => acc + entry.priceAfterDiscount, 0)) ;
   this.Net_Amount = Math.round((this.total_Price_After_Discount || 0) - this.Contract_Price);


   next()
}) ;




schema.pre("init" , function (doc){
   doc.invoice_pdf = process.env.BASE_URL + "/pdf/" +  doc.invoice_pdf
   doc.transform_pdf = process.env.BASE_URL + "/pdf/" +   doc.transform_pdf
})




schema.pre(/^find/ , function (next){
   this.populate({
      path:"orderItems" , 
      populate :{
         path:"test" , 
         model:"test"
      }
   })

   this.populate("user" , "_id name age phone email role isBlocked")
   this.populate("company" , "_id name email phone address logo description start")
   this.populate("branch" , "_id name email phone address")
   next()
})

export const orderModel = model("order" , schema)
