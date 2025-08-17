import { Schema, Types, model } from "mongoose";


const schema = new Schema({
   name:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[30 , "Should be Character Count Less Than 30 Character"] ,
   } ,
   description:{
      type:String , 
      trim : true ,
      required : true ,
      lowercase:true ,
      minLength:[2 , "Should be Character Count More Than 2 Character"] ,
      maxLength:[2000 , "Should be Character Count Less Than 2000 Character"] ,
   } ,
   testItems:[
         {
            test:{
               type:Types.ObjectId , 
               ref:"test" 
            } ,
            price:{
               type:Types.ObjectId , 
               ref:"price"
            }
         }
      ] ,
   company:{
      type:Types.ObjectId ,
      ref: "company" 
   } ,
   price:{
      type:Number
   } ,
   discount:{
      type:Number
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
} , { timestamps:true , toJSON:{virtuals:true}  } )


//& Hash Password Before Save When Add User :
schema.pre("save"  , function(next){
   if (!this.creationTimeAt) {this.creationTimeAt = Date.now() ;}
   const price =  this.testItems.reduce((acc, entry) => acc + entry.price.priceAfterDiscount , 0) ;
   this.price = Math.round( price - ( price * this.discount /  100 ) ) ;
   next()
}) ;




schema.pre(/^find/ , function(next){
   this.populate({
      path:"testItems" , 
      populate :{
         path:"test" , 
         model:"test"
      } 
   })

   this.populate({
      path:"testItems" , 
      populate :{
         path:"price" , 
         model:"price"
      }
   })
   this.populate("createdBy" , "-password")
   this.populate("company")
   next()
}) ;

schema.pre("init" , function(doc){
   if(doc.image) {
      doc.image = process.env.BASE_URL + "/profile/" + doc.image
   }
})




// //& Calculate Total Price Before Discount : 
// schema.virtual("total_Price").get(function (){
//    const total = this.cartItems.reduce((acc , entry)=>{
//       return acc + entry.price?.price
//    } , 0)
//    return Math.round(total)
// })






export const profileModel = model("profile" , schema)
