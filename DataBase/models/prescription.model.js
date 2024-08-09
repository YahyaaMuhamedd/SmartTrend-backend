import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   image :{
      type:String
   } , 
   phone :{
      type:String
   } , 
   description :{
      type:String
   } , 
   is_seen:{
      type:Boolean ,
      default:false
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

schema.pre("init" , function(doc){
   if(doc.image) {
      doc.image = process.env.BASE_URL + "Prescription/" + doc.image
   }
})


export const prescriptionModel = model("prescription" , schema)
