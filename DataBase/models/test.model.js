import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      required : true ,
      unique:[true , "Test Name is Required"] ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[100 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   slug:{
      type:String ,
      lowercase:true
   } ,
   condition :{
      type:String ,
      required :[true , "Password is required"] ,
      minLength:[10 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[400 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   description:{
      type:String ,
      required:true ,
      minLength:[10 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[400 , "Should be Character Count Less Than 50 Character"] ,
   } ,
   isActive:{
      type:Boolean ,
      default:true
   } , 
   count:{
      type:Number ,
      default:0
   } ,
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
// } , { timestamps:true } )
} , { timestamps:true , toJSON: { virtuals: true }  } )




//& Virtual Populate in Mongoose Virtuals :
schema.virtual('all_Prices', {
   ref: 'price',
   localField: '_id',
   foreignField: 'test',
   justOne: false // find first one only = true && find All price = false
});


// schema.pre("findOne" , function(){
//    this.populate("all_Prices")
// })


schema.pre(/^find/ , function(){
   this.populate("all_Prices")
})










// schema.pre(/^find/ , function(){
//    this.populate("company")
// }) ;

// userSchema.post("save" , function(){
//    console.log(this);
// }) ;


export const testModel = model("test" , schema)
