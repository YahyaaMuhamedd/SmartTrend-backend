import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   title:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[30 , "Should be Character Count Less Than 30 Character"] ,
   } ,
   message:{
      type:String , 
      minLength:[10 , "Should be Character Count More Than 10 Character"] ,
      maxLength:[5000 , "Should be Character Count Less Than 5000 Character"] ,
   } ,
   imageCover:{
      type:String
   } ,
   isActive:{
      type:Boolean ,
      default:true
   } ,
   creationTimeAt:{
      type:Number 
   } ,
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
} , { timestamps:true } )


//& Hash Password Before Save When Add User :
schema.pre("save"  , function(next){
   if (!this.creationTimeAt) {
      this.creationTimeAt = Date.now() ;
   }
   next()
}) ;



schema.pre(/^find/, function(){
   this.populate("createdBy" , "-password")
}) ;





export const advertModel = model("advert" , schema)
