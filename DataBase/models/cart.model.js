// import { Schema, Types, model } from "mongoose";


// const schema = new Schema({
//    user:{
//       type:Types.ObjectId , 
//       ref:"user" 
//    } ,
//    cartItems:[
//       {
//          test:{
//             type:Types.ObjectId , 
//             ref:"test" 
//          } ,
//          price:{
//             type:Number
//          } ,
//          priceAfterDiscount:{
//             type:Number
//          }  ,
//          discount:{
//             type:Number
//          }  ,
//       }
//    ] ,
//    totalPrice:{
//       type: Number
//    },
//    totalPriceAfterDiscount:{
//       type:Number
//    },
//    createdBy:{
//       type:Types.ObjectId ,
//       ref: "user" 
//    }
// } , { timestamps:true } )


// // schema.pre(/^find/ , function(){
// //    this.populate("test company")
// // }) ;

// // userSchema.post("save" , function(){
// //    console.log(this);
// // }) ;


// export const cartModel = model("cart" , schema)

import { Schema, Types, model } from "mongoose";
import path from "path";


const schema = new Schema({
   user:{
      type:Types.ObjectId , 
      ref:"user"  ,
      unique:true
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
         //  ,
         // final_amount:{
         //    type:Number , 
         //    default:0
         // } ,
      }
   ]
} , { timestamps:true , toJSON:{virtuals:true} , toObject:{virtuals:true} } )


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
   next()
}) ;

//& Calculate Total Price Before Discount : 
schema.virtual("total_Price").get(function (){
   // return  1000
   const total = this.cartItems.reduce((acc , entry)=>{
      return acc + entry.price.price
   } , 0)
   return total
})

//& Calculate Total Price Before Discount : 
schema.virtual("Net_Amount").get(function (){
   // return  1000
   const total = this.cartItems.reduce((acc , entry)=>{
      return acc + entry.price.final_amount
   } , 0)
   return total
})


//& Calculate Total Price Before Discount : 
schema.virtual("total_After_Discount").get(function (){
   // return  1000
   const total = this.cartItems.reduce((acc , current)=>{
      return acc + current.price.priceAfterDiscount
   } , 0)
   return total
})

export const cartModel = model("cart" , schema)
