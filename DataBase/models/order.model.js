import { Schema, Types, model } from "mongoose";


const schema = new Schema({
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
   patient_History :{
      type:String ,
   } , 
   patient_Age :{
      type:Number
   } , 
   doctor_Name :{
      type:String
   } , 
   gender:{
      type:String ,
      enum :["male" , "female"] ,
      default:"male"
   } ,
   invoice_VodafoneCash:String ,
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
         final_amount:{
            type:Number
         }  ,
      }
   ] ,
   shipping_Address:{
      street:String ,
      city:String ,
   } ,
   createdAtOrder:{
      type:Number
   }  ,
   branch_Area:{
      type:String ,
   } ,
   message:{
      type:String ,
      default:"" ,
   } ,
   branch_Approved:{
      type:Types.ObjectId , 
      ref:"branch"  ,
   } ,
   payment_Type:{
      type:String ,
      enum:["cash" , "card"] ,
      default:"cash" ,
   } ,
   isHouse_Call:{
      type:Boolean ,
      default:false
   } ,
   is_Paid:{
      type:Boolean ,
      default:false
   } ,
   invoice_number:{
      type:Number ,
   } ,
   transform_number:{
      type:Number ,
   } ,
   is_Paid_Invoice_V_Cash:{
      type:Boolean ,
      default:false
   } ,
   is_wrong_Invoice_V_Cash:{
      type:Boolean ,
      default:false
   } ,
   paidAt:Date ,
   is_Cancel:{
      type:Boolean ,
      default:false
   } ,
   is_Done:{
      type:Boolean ,
      default:false
   } ,
   cancelAt:Date ,
} , { timestamps:true , toJSON:{virtuals:true} , toObject:{virtuals:true} } )



//& Added Dynamic Creation Time At :
schema.pre("save"  , function(next){   
   if (!this.createdAtOrder) {
      this.createdAtOrder = Date.now() ;
   }
   next()
}) ;


schema.pre("init" , function (doc){
   doc.invoice_pdf = process.env.BASE_URL + "pdf/" +  doc.invoice_pdf
   doc.transform_pdf = process.env.BASE_URL + "pdf/" +   doc.transform_pdf
   doc.invoice_VodafoneCash = process.env.BASE_URL + "Invoice.V_Cash/" +   doc.invoice_VodafoneCash
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


//& Calculate Total Price Before Discount : 
schema.virtual("total_Price").get(function (){
   // return  1000
   const total = this.orderItems.reduce((acc , entry)=>{
      return acc + entry.price
   } , 0)
   return total
})


//& Calculate Net Amount : 
schema.virtual("Net_Amount").get(function (){
   // return  1000
   const total = this.orderItems.reduce((acc , entry)=>{
      return acc + entry.final_amount
   } , 0)
   return total
})

//& Calculate Total Price After Discount : 
schema.virtual("total_Price_After_Discount").get(function (){
   // return  1000
   const total = this.orderItems.reduce((acc , entry)=>{
      return acc + entry.priceAfterDiscount
   } , 0)
   return total
})

export const orderModel = model("order" , schema)
