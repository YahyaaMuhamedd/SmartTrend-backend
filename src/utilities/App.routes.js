import { Router } from "express"
import userRouter from "../modules/user/user.routes.js"

import authRouter from "../modules/authentication/auth.routes.js"
import companyRouter from "../modules/company/company.routes.js"
import testRouter from "../modules/test/test.routes.js"
import priceRouter from "../modules/Price/price.routes.js"
import offerPricesRouter from "../modules/offerPrices/offerPrices.routes.js"
import cartRouter from "../modules/cart/cart.routes.js"
import orderRouter from "../modules/order/order.routes.js"
import reportRouter from "../modules/Reports/report.routes.js"
import patientRouter from "../modules/patient/patient.routes.js"
import prescriptionRouter from "../modules/prescription/prescription.routes.js"
import onlineSystemRouter from "../modules/onlineSystem/onlineSystem.routes.js"
import branchRouter from "../modules/branch/branch.routes.js"
import advertRouter from "../modules/advert/advert.routes.js"
import excelRouter from "../modules/excelSheet/excelSheet.routes.js"
import profileRouter from "../modules/profile/profile.routes.js"


const router = Router()




   router.use("/users" , userRouter) ;
   router.use("/auth" , authRouter) ;
   router.use("/company" , companyRouter) ;
   router.use("/test" , testRouter) ;
   router.use("/price" , priceRouter) ;
   router.use("/offers" , offerPricesRouter) ;
   router.use("/cart" , cartRouter) ;
   router.use("/order" , orderRouter) ;
   router.use("/report" , reportRouter) ;
   router.use("/prescription" , prescriptionRouter) ;
   router.use("/patient" , patientRouter) ;
   router.use("/branch" , branchRouter) ;
   router.use("/advert" , advertRouter) ;
   router.use("/excel" , excelRouter) ;
   router.use("/profile" , profileRouter) ;

   router.use("/onlineSystem" , onlineSystemRouter) ;






export default router ;
