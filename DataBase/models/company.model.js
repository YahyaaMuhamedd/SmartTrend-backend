import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[100 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   email:{
      type:String ,
      lowercase:true ,
      unique:[true , "company Name is Unique"] ,
   } ,
   passwordChangedAt:{
      type:Date 
   } ,
   address:{
      type:String 
   },
   phone :{
      type:String ,
      required :[true , "Password is required"]
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
      lowercase:true ,
      minLength:[10 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[400 , "Should be Character Count Less Than 50 Character"] ,
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
      doc.logo = process.env.BASE_URL + "company/" + doc.logo
   }
})



export const companyModel = model("company" , schema)
