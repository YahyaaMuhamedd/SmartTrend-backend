import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   image :{
      type:String
   } , 
   phone :{
      type:String
   } , 
   message :{
      type:String
   } , 
   download_URL :{
      type:String
   } , 
   is_seen:{
      type:Boolean ,
      default:false
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

schema.pre("init" , function(doc){
   if(doc.image) {
      doc.image = process.env.BASE_URL + "/Prescription/" + doc.image
   }
})


export const prescriptionModel = model("prescription" , schema)
