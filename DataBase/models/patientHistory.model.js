import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   user:{
      type:Types.ObjectId ,
      ref: "user" ,
      unique: true 
   } ,
   history_disease:{
      type:String , 
      trim : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[1000 , "Should be Character Count Less Than 1000 Character"] ,
   } ,
   history_medicines:{
      type:String , 
      trim : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[1000 , "Should be Character Count Less Than 1000 Character"] ,
   } ,
   history_surgeries:{
      type:String , 
      trim : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[1000 , "Should be Character Count Less Than 1000 Character"] ,
   } ,
   images:[
      {
         type:String
      }
   ] ,
   creationTimeAt:{
      type:Number 
   } ,
} , { timestamps:true } )


//& Hash Password Before Save When Add User :
schema.pre("save"  , function(next){
   if (!this.creationTimeAt) {
      this.creationTimeAt = Date.now() ;
   }
   next()
}) ;



schema.pre(/^find/, function(){
   this.populate("user" , "-password")
}) ;

schema.pre("init" , function(doc){
   if(doc.images.length > 0) {
      doc.images = doc.images.map((image)=>{
         return image = process.env.BASE_URL + "/history/" + image
      }) ;
   }
})



export const historyModel = model("history" , schema)
