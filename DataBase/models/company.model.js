import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[100 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   email:{
         type:String ,
         unique:[true , "company Name is Required"] ,
      },
   password :{
      type:String ,
      required :[true , "Password is required"] 
   } ,
   passwordChangedAt:{
      type:Date 
   } ,
   address:{
      type:String 
   },
   phone :{
      type:String ,
      required :[true , "Password is required"]
   } ,
   isActive:{
      type:Boolean ,
      default:true
   } ,
   logo:{
      type:String 
   } ,
   description:{
      type:String ,
      lowercase:true ,
      minLength:[10 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[400 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   start:{
      type:Date
   } ,   
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
} , { timestamps:true } )   



// } , { timestamps:true , toJSON: { virtuals: true }  } )   


// //& Virtual Populate in Mongoose Virtuals :
// schema.virtual('all_Tests', {
//    ref: 'test',
//    localField: '_id',
//    foreignField: 'company',
//    justOne: true
// });   

// schema.pre("findOne" , function(){
//    this.populate("all_Tests")
// })   



//& Hash Password Before Save When Add User :
schema.pre("save"  , function(){
   if(this.password) this.password = bcrypt.hashSync(this.password , 8) ;
}) ;


// & Hash Password Before Save When Update User :
schema.pre("findOneAndUpdate" , function(){
   if(this._update.password) this._update.password = bcrypt.hashSync(this._update.password , 8) ; 
}) ;


schema.pre("init" , function(doc){
   if(doc.logo) {
      doc.logo = process.env.BASE_URL + "company/" + doc.logo
   }
})



export const companyModel = model("company" , schema)
