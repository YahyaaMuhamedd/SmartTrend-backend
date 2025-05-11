import { globalError } from "./utilities/globalError.js";
import appRouter from "./utilities/App.routes.js"
import passport from 'passport';
import { loginWithGoogle } from "./modules/authentication/auth.controller.js";



import env from "dotenv"

env.config()


export const initApp = (app)=>{


   //^ User Routing :
   app.use("/api/v1" , appRouter) ;



   //^ Login With Google :
   app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
   app.get('/auth/google/callback' , passport.authenticate('google', { failureRedirect: '/' }), loginWithGoogle) ;


   //^ Express Middle Ware
   app.get('/*', (req, res) => res.json({message:'Not_Found_Page'}))




   //^ global Error Handling Middle Ware :
   app.use(globalError) ;
}