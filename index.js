
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

//!========================================================================================
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import expressSession from 'express-session';
import jwt from 'jsonwebtoken';
import { userModel } from './DataBase/models/user.model.js';
import configGoogle from './src/services/configGoogle.js';
import { loginWithGoogle } from './src/modules/authentication/auth.controller.js';
//!========================================================================================

env.config()


const app = express()
const PORT = process.env.PORT || 5000;




//& Express Middle Ware :
app.use(cors());
app.use(express.json()) ;

//!========================================================================================
   //* Login With Google :
      app.use(configGoogle());
      app.use(passport.initialize());
      app.use(passport.session());
      passport.use(
         new GoogleStrategy(
         {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
         },(accessToken, refreshToken, profile, done) => {done(null, profile);})
      );
      passport.serializeUser((user, done) => done(null, user));
      passport.deserializeUser((obj, done) => done(null, obj));
//!========================================================================================



app.use("/" , express.static("Uploads")) ;
app.use("/pdf" , express.static("Docs")) ;

// Serve static files from specific directories
// app.use("/", express.static(path.join(process.cwd(), 'Uploads')));
// app.use("/pdf", express.static(path.join(process.cwd(), 'Docs')));

//& Receive Webhook From Paymob :
app.post("/webhook" , webhookMiddleWre)

console.log("🚀 New version deployed !!!");

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

