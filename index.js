
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

env.config()

const app = express()
const port = process.env.PORT ||  5000 ;




//& Express Middle Ware :
app.use(cors(
   {
      origin: "https://hotel-backend-xi.vercel.app" ,
      //  methods: {"POST", "GET", "DELETE", "PUT"},
      credentials: true
   }
));
app.use(express.json()) ;
app.use("/" , express.static("Uploads")) ;
app.use("/pdf" , express.static("Docs")) ;



initApp(app)

//& Data Base Connection :
dbConnection()

//! Handle Error dbConnection And External Express => End the Code :
process.on("unhandledRejection" , (error)=>{
   console.log("Error" , error);
});


export const server = app.listen(port, () => console.log(`Server is running ....`))


//& Socket io Connection :
socketConnect(server)








// import express from "express"
// import mongoose from "mongoose"
// import cors from "cors";
// import dotenv from "dotenv";


// import connectDB from "./mongodb/connect.js";

// dotenv.config();

// const app = express();
// mongoose.connect

// app.use(cors(
//   {
//     origin: "https://hotel-backend-xi.vercel.app" ,
//    //  methods: {"POST", "GET", "DELETE", "PUT"},
//     credentials: true
//   }
// ));
// app.use(express.json());
// app.use(express.json({ limit: "25mb" }));


// app.get('/', (req, res) => {
//   res.send("hello hotel Mahmoud")
//   console.log("Hello hotel")
// })

// const startServer = () => {
//   try {
//    //  connectDB(process.env.MONGODB_URL)
//     app.listen(5000, () => {
//       console.log("Server listening on 5000 http://localhost:5000");
//     });
//   } catch (err) {
//     console.log(err)
//   }
// }

// startServer();