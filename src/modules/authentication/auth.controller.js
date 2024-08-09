import { userModel } from "../../../DataBase/models/user.model.js";
import { sendEmail } from "../../Emails/userEmails/sendEmail.js";
import { AppError } from "../../utilities/AppError.js";
import { catchError } from "../../utilities/catchError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { customAlphabet } from 'nanoid'
import QRCode  from'qrcode' ;
import path from "path"
import { companyModel } from "../../../DataBase/models/company.model.js";



const nanoid = customAlphabet('123456789', 6)



//& Sign Up  :
export const signUp = catchError(
   async (req , res , next)=>{
      const {name  , phone , birthDay , email ,  password } = req.body ;

     //& Calculation Age From BirthDay :
      let age = 0 ;
      let nowAge = (birthDay)=>{
         let dateNow = new Date()
         let birth = new Date(birthDay)
         let diff = dateNow - birth
         let age = Math.floor(diff/1000/60/60/24/365);
         return age
      }
      age = nowAge(birthDay)


      const user = await userModel.create({name , age  , phone , birthDay , email  , password}) ;


      const token = jwt.sign({_id:user._id , name:user.name , phone: user.phone , email:user.email , role:user.role} , process.env.SECRET_KEY )

      !user && next(new AppError("User Not Added" , 404))
      user && res.json({message:"success" ,  token})
   }
)



//& Sign In :
export const signIn = catchError(
   async (req , res , next)=>{
      const{email , password} = req.body ;
      const user = await userModel.findOne({email})
      const loggedUser = await userModel.findById(user._id).select("name role  phone birthDay  email  age imgCover") ;
      if(user && bcrypt.compareSync(password , user?.password)) {
         const token = jwt.sign(
            {_id:user._id , name:user.name , phone: user.phone , email:user.email , role:user.role} , 
            process.env.SECRET_KEY , 
            {expiresIn:"2h"} // expired Token After 2 hours or ==> expiresIn:"2h" 
            // {expiresIn:60*60*2} // expired Token After 2 hours or ==> expiresIn:"2h" 
         ) 

         return res.json({message:"success"  , user:loggedUser ,   token }) ;
      }
      return next(new AppError("Email Or Password InCorrect" , 401)) ;
   }
)



//& Change Password :
export const changePassword = catchError(
   async(req , res , next)=>{
      const user = await userModel.findById(req.user?._id) ;


         //& Check User Old Password Correct or Not :
         if(user && bcrypt.compareSync(req.body.oldPassword , user.password)) {
            user.password = req.body.password ;
            user.passwordChangedAt = Date.now() ;
         }else{
            return next(new AppError("Email Or Old Password InCorrect" , 404)) ;
         }

         //& Generate Token :
         const token = jwt.sign({_id:user._id , name:user.name , phone: user.phone , email:user.email , role:user.role} , process.env.SECRET_KEY )

      await user.save()
      return res.json({message:"success" , token})
   }
)


//& Send Code :
export const sendCode = catchError(
   async (req , res , next)=>{

      const user = await userModel.findById(req.user._id) ;
      if(!user) return next(new AppError("User Not Found")) ; 
      let codeNum = nanoid()
      let codeHtml = ()=>{
         return `
         <h2>${codeNum}</h2>
         `
      }
      user.confirmedCode = codeNum ;
      await userModel.updateOne({_id:user._id},{confirmedCode:codeNum})
      sendEmail(req.user.email , codeHtml )

      res.json({message:"success" , codeNum})
   }
)


//&  Confirmed Email :
export const confirmedEmail = catchError(
   async (req , res , next)=>{
      const {code} = req.body ;

      const user = await userModel.findById(req.user._id) ;
      if(!user) return next(new AppError("User Not Found")) ;
      if(user?.confirmedCode == code){
         await userModel.updateOne({_id:user._id},{confirmedEmail:true})
         return res.json({message:"success"}) ;
      }
      return next(new AppError("InCorrect Code")) ;
   }
)



//&  Generate QR_Code :
export const generateQR_Code = catchError(
   async (req , res , next)=>{
      const link = `Url_WebSite Good Morning! : https://eng-mahmoudothman.github.io/free-palestine-Front-End/`
      QRCode.toDataURL(link, { errorCorrectionLevel: 'L' }, function (err, url) {
            res.send(`<img src='${url}'/>`)
            // res.json({message:"success" , url , link})
         })
   }
)


//^===================== Authentication Online System ========================


//& Sign In Company Branch :
export const signInBranch = catchError(
   async (req , res , next)=>{
      const{email , password} = req.body ;
      const company = await companyModel.findOne({email})

      const loggedCompany = await companyModel.findById(company?._id).select("name  phone  email") ;
      if(company && bcrypt.compareSync(password , company?.password)) {
         const token = jwt.sign(
            {_id:company._id , name:company.name , phone: company.phone , email:company.email} , 
            process.env.SECRET_KEY , 
            {expiresIn:"1h"} // expired Token After 2 hours or ==> expiresIn:"2h" 
            // {expiresIn:60*60*2} // expired Token After 2 hours or ==> expiresIn:"2h" 
         ) 

         return res.json({message:"success"  , company:loggedCompany ,   token }) ;
      }

      return next(new AppError("Email Or Password InCorrect" , 401)) ;
   }
)