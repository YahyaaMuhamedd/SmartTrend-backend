import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   title:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[50 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   message:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[100 , "Should be Character Count Less Than 100 Character"] ,
   } ,
   image:{
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

schema.pre("init" , function(doc){
   if(doc.image) {
      doc.image = process.env.BASE_URL + "/advert/" + doc.image
   }
})



export const advertModel = model("advert" , schema)
