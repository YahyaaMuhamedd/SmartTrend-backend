import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[50 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   phone:{
      type:String ,
      required:[true , "Phone is Required"] 
   } ,
   email:{
      type:String ,
      required:true ,
      lowercase:true ,
      unique:[true , "Email is Required"]
   } ,
   password :{
      type:String ,
      required :[true , "Password is required"] 
   } ,
   address:{
      street:String , 
      city :String ,
      area:String ,
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


//& Hash Password Before Save When Add User :
schema.pre("save"  , function(next){
   //I use this code so that the password is not forgotten every time 
   // I save it, even if I don’t send the password. 
   // If I don’t even send the password, its value at the beginning is undefined, 
   // and thus the undefined is forgotten, and of course the result is wrong.
   if(this.isModified('password')) this.password = bcrypt.hashSync(this.password , 8) ;

   if (!this.creationTimeAt) {
      this.creationTimeAt = Date.now() ;
   }
   next()
}) ;



schema.pre(/^find/, function(){
   this.populate("company createdBy" , "-password")
}) ;





export const branchModel = model("branch" , schema)
