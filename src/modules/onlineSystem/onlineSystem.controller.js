import { AppError } from "../../utilities/AppError.js";
import { catchError } from "../../utilities/catchError.js";
import { orderModel } from "../../../DataBase/models/order.model.js";
import { customAlphabet } from 'nanoid'
import { create_pdf } from "../../services/create_pdf.js";
import { pdf_transform } from "../../templates/pdf.transform.js";
import { branchModel } from "../../../DataBase/models/branch.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import env from "dotenv"
env.config()

const alphabet = process.env.INVOICE_NUMBER || '012345678';
const transform_nanoid = customAlphabet(alphabet , 10) ;



//& Sign In branch Branch :
export const signInBranch = catchError(
   async (req , res , next)=>{
      const{email , password} = req.body ;
      const branch = await branchModel.findOne({email})

      const loggedBranch = await branchModel.findById(branch?._id).select("-_id name  phone  email address company") ;
      if(branch && bcrypt.compareSync(password , branch?.password)) {
         const token = jwt.sign(
            {_id:branch._id , name:branch.name , phone: branch.phone , email:branch.email ,  address:branch.address  , company:branch.company} , 
            process.env.SECRET_KEY , 
            {expiresIn:process.env.TOKEN_EXPIRATION} // expired Token After 1 hours
         ) 

         return res.json({message:"success"  , branch:loggedBranch ,   token }) ;
      }

      return next(new AppError("Email Or Password InCorrect" , 401)) ;
   }
)





//& Confirmed Approved Online System in Branch Laboratory :
export const transformOnlineSystem = catchError(
   async(req , res , next)=>{
      const {invoice_number} = req.body ;
      const {company} = req.branch ;
      const transform_number =  transform_nanoid();
      
      const order = await orderModel.findOne({
         invoice_number , 
         is_Cancel:false , 
         is_Paid:true , 
         is_Approved:false ,
         invoiceExpiryDate: { $gte: Date.now() }
      }) ;

      
      if(!order) return next(new AppError("Order Expired or Not Exist,  Please Connect On Hot line :3245" , 404)) ;
      if(order.company?._id.toString() !== company._id.toString()) return next(new AppError("Company Not Valid In This Order Please Connect On Hot line :3245 !" , 404)) ;

      const patient_Name_Slug = slugify(order?.patient_Name) ;

      order.is_Approved = true ;
      order.approved_At = Date.now() ;
      order.branch = req.branch._id
      order.transform_number =  transform_number;
      order.transform_pdf  = `transform_${patient_Name_Slug}_${order._id}.pdf`
      await order.save() ;

      //! Create Transformation invoice Pdf  Orders :
      create_pdf(pdf_transform , order , `transform_${patient_Name_Slug}_${order._id}`);

      res.json({message:"success" , url:`${process.env.BASE_URL}/pdf/transform_${patient_Name_Slug}_${order._id}.pdf`}) ;
   }
)





//& Get And Search Approved Order Confirmed Online System ion Branch :
export const getApprovedOrderInfo = catchError(
   async(req , res , next)=>{
      const {invoice_number} = req.query ;
      const {email} = req.branch ;
      
      
      const order = await orderModel.findOne({invoice_number}) ;
      if(!order) return next(new AppError("Order Not Found Please Connect On Hot line :3245 !" , 404)) ;

      if(email !== order.branch.email) return next(new AppError("Order Not Found This branch Please Connect On Hot line :3245 !" , 404)) ;

      res.json({message:"success" , order:{
         patient_Name:order.patient_Name ,
         branch_Name:order?.branch.name ,
         patient_Phone:order.patient_Phone ,
         patient_Age:order.patient_Age ,
         patient_History:order.patient_History ,
         gender:order.gender ,
         invoice_number:order.invoice_number ,
         is_Paid:order.is_Paid ,
         is_Cancel:order.is_Cancel ,
         is_Approved:order.is_Approved ,
      }}) ;
   }
)




