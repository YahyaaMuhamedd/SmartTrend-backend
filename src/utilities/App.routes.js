import { Router } from "express"
import userRouter from "../modules/user/user.routes.js"

import authRouter from "../modules/authentication/auth.routes.js"
import companyRouter from "../modules/company/company.routes.js"
import testRouter from "../modules/test/test.routes.js"
import priceRouter from "../modules/Price/price.routes.js"
import cartRouter from "../modules/cart/cart.routes.js"
import orderRouter from "../modules/order/order.routes.js"
import reportRouter from "../modules/Reports/report.routes.js"
import patientRouter from "../modules/patient/patient.routes.js"
import prescriptionRouter from "../modules/prescription/prescription.routes.js"


const router = Router()




   router.use("/users" , userRouter) ;
   router.use("/auth" , authRouter) ;
   router.use("/company" , companyRouter) ;
   router.use("/test" , testRouter) ;
   router.use("/price" , priceRouter) ;
   router.use("/cart" , cartRouter) ;
   router.use("/order" , orderRouter) ;
   router.use("/report" , reportRouter) ;
   router.use("/prescription" , prescriptionRouter) ;
   
   router.use("/patient" , patientRouter) ;






export default router ;
