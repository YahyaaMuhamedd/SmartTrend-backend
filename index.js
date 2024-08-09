
//! Handle Error External Express => Start the Code :
process.on("uncaughtException" , (error)=>{
   console.log("Error" , error);
})


import express from 'express'

import cors from 'cors'
import { initApp } from './src/initApp.js';
import { dbConnection } from './DataBase/dbConnection.js';
import env from "dotenv"
// import { catchError } from './src/utilities/catchError.js';
import { customAlphabet } from 'nanoid'
import { socketConnect } from './src/services/socketConnection.js';
const nanoid = customAlphabet('012345678', 10)
import { Server } from "socket.io";


env.config()

const app = express()
const port = process.env.PORT ||  5000 ;




//& Express Middle Ware :
app.use(express.json()) ;
app.use(cors()) ;
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

