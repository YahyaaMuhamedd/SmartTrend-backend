import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   patient_Name :{
      type:String ,
      required:true ,
      lowercase:true
   } , 
   patient_Age :{
      type:Number
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

schema.pre(/^find/ , function(){
   this.populate("createdBy")
}) ;


export const patientModel = model("patient" , schema)
