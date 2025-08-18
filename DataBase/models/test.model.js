import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      required : true ,
      unique:[true , "Test Name is Unique"] ,
      lowercase:true ,
      minLength:[1 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[300 , "Should be Character Count Less Than 300 Character"] ,
   } ,
   slug:{
      type:String ,
      lowercase:true
   } ,
   condition :{
      type:String ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[800 , "Should be Character Count Less Than 800 Character"] ,
   } ,
   description:{
      type:String ,
      minLength:[10 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[400 , "Should be Character Count Less Than 400 Character"] ,
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
      type:Number ,
      index:true
   } ,
   createdBy:{
      type:Types.ObjectId ,
      ref: "user" 
   }
// } , { timestamps:true } )
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
   this.populate("all_Prices")
})



export const testModel = model("test" , schema)
