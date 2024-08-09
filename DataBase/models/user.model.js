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
      unique:[true , "Email is Required"]
   } ,
   password :{
      type:String ,
      required :[true , "Password is required"] 
   } ,
   age: {
      type:Number , 
   } ,
   birthDay:{
      type:Date , 
      required : true ,
   } ,
   imgCover:{
      type:String
   } ,
   addresses:[{
      street:String , 
      phone:String ,
      city :String
   }] ,
   isBlocked:{
      type:Boolean ,
      default:false
   } ,
   confirmedEmail:{
      type:Boolean ,
      default:false
   } ,
   confirmedCode:{
      type:String
   } ,
   role:{
      type:String ,
      lowercase:true , 
      enum:["user" , "admin" , "moderator"] ,
      default:"user"
   } ,
   // confirmedCode:{
   //    type:Number 
   // } ,
   // passwordChangedAt:{
   //    type:Number 
   // } ,
   passwordChangedAt:{
      type:Date 
   } ,
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
} , { timestamps:true } )


//& Hash Password Before Save When Add User :
schema.pre("save"  , function(){
   if(this.password) this.password = bcrypt.hashSync(this.password , 8) ;
}) ;


// & Hash Password Before Save When Update User :
schema.pre("findOneAndUpdate" , function(){
   if(this._update.password) this._update.password = bcrypt.hashSync(this._update.password , 8) ; 
   // this.populate("wishList")
}) ;



schema.pre("init" , function(doc){
   if(doc.imgCover) {
      doc.imgCover = process.env.BASE_URL + "users/" + doc.imgCover
   }
})



export const userModel = model("user" , schema)
