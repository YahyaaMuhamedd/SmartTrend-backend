import { globalError } from "./utilities/globalError.js";
import appRouter from "./utilities/App.routes.js"




import env from "dotenv"

env.config()


export const initApp = (app)=>{



   //^ User Routing :
   app.use("/api/v1" , appRouter) ;




   //^ Express Middle Ware
   app.get('/*', (req, res) => res.json({message:'Not_Found_Page'}))



   //^ global Error Handling Middle Ware :
   app.use(globalError) ;
}


