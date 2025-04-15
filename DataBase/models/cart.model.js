import { Schema, Types, model } from "mongoose";




const schema = new Schema({
   user:{
      type:Types.ObjectId , 
      ref:"user"  ,
      unique:true
   } ,
   company:{
      type:Types.ObjectId , 
      ref:"company"
   } ,
   cartItems:[
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
   creationTimeAt:{
      type:Number 
   } 
} , { timestamps:true , toJSON:{virtuals:true} , toObject:{virtuals:true} } )


//& Added Dynamic Creation Time At :
schema.pre("save"  , function(next){   
   if (!this.creationTimeAt) {
      this.creationTimeAt = Date.now() ;
   }
   next()
}) ;


schema.pre(/^find/ , function(next){
   this.populate({
      path:"cartItems" , 
      populate :{
         path:"test" , 
         model:"test"
      } 
   })

   this.populate({
      path:"cartItems" , 
      populate :{
         path:"price" , 
         model:"price"
      }
   })
   this.populate("user")
   this.populate("company")
   next()
}) ;

//& Calculate Total Price Before Discount : 
schema.virtual("total_Price").get(function (){
   const total = this.cartItems.reduce((acc , entry)=>{
      return acc + entry.price?.price
   } , 0)
   return total
})

//& Calculate Total Price Before Discount : 
schema.virtual("Net_Amount").get(function (){
   const total = this.cartItems.reduce((acc , entry)=>{
      return acc + entry.price?.final_amount
   } , 0)
   return total
})


//& Calculate Total Price Before Discount : 
schema.virtual("total_After_Discount").get(function (){
   const total = this.cartItems.reduce((acc , current)=>{
      return acc + current.price?.priceAfterDiscount
   } , 0)
   return total
})

export const cartModel = model("cart" , schema)
