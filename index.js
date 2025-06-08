
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

//!========================================================================================
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import configGoogle from './src/services/configGoogle.js';
import { loginWithGoogle } from './src/modules/authentication/auth.controller.js';
//!========================================================================================


import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';




env.config();
const app = express() ;
const PORT = process.env.PORT || 5000 ;




//!================= MIDDLEWARE SECURITY SETUP ============================================
app.use(cors()) ;
app.use(express.json({ limit: '3000kb' })) ;
app.use(helmet()) ;
app.use(hpp()) ;
app.use(mongoSanitize()) ;
app.use(xss()) ;
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 100,
   message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api', limiter);






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

   //* Login With Google :
      app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
      app.get('/auth/google/callback' , passport.authenticate('google', { failureRedirect: '/' }), loginWithGoogle) ;

//!========================================================================================


//! Serve static files :
app.use("/" , express.static("Uploads")) ;
app.use("/pdf" , express.static("Docs")) ;


//& Receive Webhook From Paymob :
app.post("/webhook" , webhookMiddleWre)

console.log("🚀 New version deployed !!!");

initApp(app)

//& Data Base Connection :
dbConnection()

export const server = app.listen(PORT , () => console.log(`Server is running ....`))

//& Socket io Connection :
// socketConnect(server)



//! Handle Error dbConnection And External Express => End the Code :
process.on("unhandledRejection" , (error)=>{
   console.log("Error" , error);
});


