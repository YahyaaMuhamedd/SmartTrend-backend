import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   patient_Name :{
      type:String ,
      required:true ,
      lowercase:true
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
   patient_Phone :{
      type:String
   } , 
   gender:{
      type:String ,
      enum :["male" , "female"] ,
      default:"male"
   } ,
   birthDay:{
      type:Date , 
      required : true ,
   } ,
   address:{
      street:String , 
      city :String
   } ,
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
} , { timestamps:true } )



// & Hash Password Before Save When Update User :
schema.pre(/^find/ , function(){
   this.populate("createdBy")
}) ;


export const patientModel = model("patient" , schema)
