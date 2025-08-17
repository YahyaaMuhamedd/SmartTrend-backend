import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      lowercase:true ,
      minLength: [3, "Should be more than 2 characters"] ,
      maxLength: [400, "Should be less than 400 characters"]
   } ,
   email:{
      type:String ,
      trim : true ,
      lowercase:true ,
      unique:[true , "Email must be unique"] ,
      match: [/\S+@\S+\.\S+/, "Email format is invalid"]
   } ,
   passwordChangedAt:{
      type:Date 
   } ,
   service:{
      type:String ,
      default:"analysis" 
   },
   address:{
      type:String 
   },
   phone :{
      type:String ,
      required :[true , "Phone is required"] ,
      match: [/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"]
   } ,
   isActive:{
      type:Boolean ,
      default:true
   } ,
   logo:{
      type:String 
   } ,
   description:{
      type:String ,
      trim : true ,
      lowercase:true ,
      minLength: [3, "Should be more than 2 characters"] ,
      maxLength: [400, "Should be less than 400 characters"]
   } ,
   start:{
      type:Date
   } ,   
   creationTimeAt:{
      type:Number 
   } ,
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
} , { timestamps:true } )   







//& Added Dynamic Creation Time At :
schema.pre("save"  , function(next){   
   if (!this.creationTimeAt) {
      this.creationTimeAt = Date.now() ;
   }
   next()
}) ;


schema.pre("init" , function(doc){
   if(doc.logo) {
      doc.logo = process.env.BASE_URL + "/company/" + doc.logo
   }
})



export const companyModel = model("company" , schema)
