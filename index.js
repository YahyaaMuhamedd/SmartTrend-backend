
//! Handle Error External Express => Start the Code :
process.on("uncaughtException" , (error)=>{
   console.log("Error" , error);
})


import express from 'express'
import cors from 'cors'
import { initApp } from './src/initApp.js';
import { dbConnection } from './DataBase/dbConnection.js';
import env from "dotenv"
import { socketConnect } from './src/services/socketConnection.js';
import { webhookMiddleWre } from './src/modules/order/order.controller.js';
import bcrypt from "bcrypt";
import { create_pdf } from './src/services/create_pdf.js';
import { pdf_invoice } from './src/templates/pdf.invoice.js';
import { temp_test } from './src/templates/temp_test.js';
env.config()


const app = express()
const PORT = process.env.PORT || 5000;




//& Express Middle Ware :
app.use(cors());
app.use(express.json()) ;




//* Active Website Now:
// (async () => {
//    let hashedKey = await bcrypt.hash("Mahmoud_Othman*8121990", 10);
//    console.log("🔒 Encrypted Key:", hashedKey);
//  })();
const key = process.env.SECRET_KEY_ACTIVATION ;
const start = await bcrypt.compare(key, "$2b$10$71/RlUIfWMiyVUadD645seg/rTTM0iOyY/9hO5VgwBa9etADMpMoW");
app.use((req , res , next)=>{
   if(!start){
      res.status(503).json({message:" 🔒  Website is currently inactive 🚫 "})
   }else{
      return next()
   }
})
//* ==================




app.use("/" , express.static("Uploads")) ;
app.use("/pdf" , express.static("Docs")) ;



//& Receive Webhook From Paymob :
app.post("/webhook" , webhookMiddleWre)


initApp(app)

//& Data Base Connection :
dbConnection()

export const server = app.listen(PORT, () => console.log(`Server is running ....`))


//& Socket io Connection :
socketConnect(server)




//! Handle Error dbConnection And External Express => End the Code :
process.on("unhandledRejection" , (error)=>{
   console.log("Error" , error);
});



      // const data  = {};
      // try {
      //    await create_pdf(temp_test , data , `invoice_MahmoudOthman_123`);
      // } catch (error) {
      //    console.log(error);
      // }
      

