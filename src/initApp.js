import { globalError } from "./utilities/globalError.js";
import appRouter from "./utilities/App.routes.js"
import passport from 'passport';
import { loginWithGoogle } from "./modules/authentication/auth.controller.js";



import env from "dotenv"

env.config()


export const initApp = (app)=>{

 //^ Login With Google :
   app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
   app.get('/auth/google/callback' , passport.authenticate('google', { failureRedirect: '/' }), loginWithGoogle) ;




   
   //^ User Routing :
   app.use("/api/v1" , appRouter) ;




   //^ Express Middle Ware
   app.get('/*', (req, res) => res.json({message:'Not_Found_Page'}))




   //^ global Error Handling Middle Ware :
   app.use(globalError) ;
}