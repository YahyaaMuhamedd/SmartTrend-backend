import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   testName:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 1 Character"] ,
      maxLength:[100 , "Should be Character Count Less Than 100 Character"] ,
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
      min: 0 
   } ,
   final_amount:{
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
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
} , { timestamps:true } )


schema.pre("findOne" , function(){
   this.populate("test company createdBy")
}) ;

// userSchema.post("save" , function(){
//    console.log(this);
// }) ;


export const priceModel = model("price" , schema)
