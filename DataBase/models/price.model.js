import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   testName:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 1 Character"] ,
      maxLength:[400 , "Should be Character Count Less Than 400 Character"] ,
   } ,
   companyName:{
      type:String , 
      required : true ,
      trim : true ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 1 Character"] ,
      maxLength:[100 , "Should be Character Count Less Than 100 Character"] ,
   } ,
   price :{
      type:Number ,
      required :[true , "Price is required"] ,
   } ,
   priceAfterDiscount :{
      type:Number ,
   } ,
   discount:{
      type:Number ,
      min: 0 ,
      set: value => Math.floor(value)  // <-- هنا بنقرب تلقائيًا عند الكتابة 
   } ,
   contract_Price:{
      type:Number ,
      min: 0 
   } ,
   test:{
      type:Types.ObjectId ,
      ref: "test" 
   } ,
   company:{
      type:Types.ObjectId ,
      ref: "company" 
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
   if (this.discount) this.discount = Math.floor(this.discount);
   next()
}) ;

schema.pre("findOne" , function(){
   this.populate("test company createdBy")
}) ;


export const priceModel = model("price" , schema)
