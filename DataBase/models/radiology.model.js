import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      required : true ,
      unique:[true , "Test Name is Unique"] ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[200 , "Should be Character Count Less Than 200 Character"] ,
   } ,
   slug:{
      type:String ,
      lowercase:true
   } ,
   condition :{
      type:String ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
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
   creationTimeAt:{
      type:Number 
   } ,
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
} , { timestamps:true , toJSON: { virtuals: true }  } )



//& Added Dynamic Creation Time At :
schema.pre("save"  , function(next){   
   if (!this.creationTimeAt) {
      this.creationTimeAt = Date.now() ;
   }
   next()
}) ; 


//& Virtual Populate in Mongoose Virtuals :
schema.virtual('all_Prices', {
   ref: 'price',
   localField: '_id',
   foreignField: 'test',
   justOne: false // find first one only = true && find All price = false
});


schema.pre(/^find/ , function(){
   this.populate("createdBy")
}) ;



export const radiologyModel = model("radiology" , schema)
