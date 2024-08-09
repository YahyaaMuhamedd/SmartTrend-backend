import env from "dotenv"

env.config()

let mode = process.env.MODE

export const globalError = (error , req , res , next)=>{

   error.statusCode = error.statusCode || 500
   
   if(mode === "development"){
      return res.status(error.statusCode).json({message:error.message,Error:error , Stack:error.stack})
   }else{
      return res.status(error.statusCode).json({message:error.message,Error:error })
   }
}