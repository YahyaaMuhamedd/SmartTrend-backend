import { userModel } from "../../../DataBase/models/user.model.js";
import { sendEmail } from "../../Emails/userEmails/sendEmail.js";
import { AppError } from "../../utilities/AppError.js";
import { catchError } from "../../utilities/catchError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import QRCode  from'qrcode' ;
import { customAlphabet, } from 'nanoid' ;
import generateToken from "../../handlers/generateToken.js";
const nanoid = customAlphabet('0123456789', 6) ;







//& Sign Up  :
export const signUp = catchError(
   async (req , res , next)=>{
      const {name  , phone , birthDay , email ,  password , gender } = req.body ;

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


      const user = await userModel.create({name , age , gender , phone , birthDay , email  , password}) ;
      const token = generateToken(user) ;

      !user && next(new AppError("User Not Added" , 404))
      user && res.json({message:"success" ,  token})
   }
)



//& Sign In :
export const signIn = catchError(
   async (req , res , next)=>{
      const{userAccount ,  password} = req.body ;
      
      const user = await userModel.findOne({$or:[{email : userAccount } , {phone : userAccount }]}) ;
      !user && next(new AppError("User Not Exist" , 401)) ; 

      // const loggedUser = await userModel.findById(user._id).select("-_id name role  phone birthDay email  age imgCover") ;
      if(user && bcrypt.compareSync(password , user?.password)) {
         const token = generateToken(user) ;
         return res.json({message:"success" ,  token }) ;
      }
      return next(new AppError("Email Or Password InCorrect" , 401)) ;
   }
)




//^ All Steps Change Password :
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
         const token = generateToken(user) ;

         await user.save()
      return res.json({message:"success" , token})
   }
)







//^ All Steps Activated Account Email :
//& Send Code :
export const sendCodeToEmailActivation = catchError(
   async (req , res , next)=>{

      const otp = nanoid() ;
      const user = await userModel.findById(req.user._id)
      if(!user) return next(new AppError("User Not Registration")) ; 

      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

      user.otp_code = otp;
      user.otpExpiry = expiry;
      await user.save();

      const subject =  "Activate Your Account for - Fekrah Medical ✔"

      let codeHtml = ()=>{
         return `
            <p style="font-size:16px; font-weight:bold;">Submit this activated code : <span style="display:inline-block ;  padding:2px; letter-spacing: 2px; color:white;  background-color:rgb(143,84,201) ;font-size:18px;">${otp}</span> If you did not request activated account, please ignore this email!</p>
         `
      }
      sendEmail(user.email , subject , codeHtml )

      res.json({message:"success" , otp})
   }
)
//&  Confirmed Email :
export const confirmedEmail = catchError(
   async (req , res , next)=>{
      const {OTP} = req.body ;

      const user = await userModel.findById(req.user._id) ;

      if (!user || user.otp_code !== OTP || user.otpExpiry < new Date()) return next(new AppError("Invalid or expired OTP , Please Enter Correct valid OTP !")) ; 

      await userModel.updateOne({_id:user._id},{
         confirmedEmail:true ,
         otp_code:null ,
         otpExpiry:null ,
      })
      return res.json({message:"Activated Account Successfully"}) ;
   }
)







//^ All Steps Forget Password :
   //& 1- Send Code To Email :
   export const sendCodeToEmail = catchError(
      async (req , res , next)=>{
         const{email} = req.body ;

         const otp = nanoid() ;
         const user = await userModel.findOne({email})
         if(!user) return next(new AppError("User Not Registration")) ; 



         const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

         user.otp_code = otp;
         user.otpExpiry = expiry;
         await user.save();

         let codeHtml = ()=>{
            return `
               <p style="font-size:16px; font-weight:bold;">Submit this reset password code : <span style="display:inline-block ;  padding:2px; letter-spacing: 2px; color:white;  background-color:rgb(143,84,201) ;font-size:18px;">${otp}</span> If you did not request a change of password, please ignore this email!</p>
            `
         }
         const subject =  "Your Password Reset Code (valid for 10 minutes) To reset your password."
         sendEmail(user.email , subject , codeHtml ) ;
         // res.json({message:"Create OTP Successfully" , user_id:user._id}) ;
         res.json({ message: "OTP sent to your email" });

      }
   )
   //& 2- Verify OTP  :
   export const verifyOTP = catchError(
      async (req , res , next)=>{
         const{email , OTP} = req.body ;

         const user = await userModel.findOne({email})

         if (!user || user.otp_code !== OTP || user.otpExpiry < new Date()) return next(new AppError("Invalid or expired OTP , Please Enter Correct valid OTP !")) ; 

         const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' , 20);

         const resetToken = nanoid();
         const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة صلاحية

         user.resetToken = resetToken;
         user.resetTokenExpiry = expiry;
         user.otp_code = null;
         user.otpExpiry = null;
         await user.save();

         res.json({message:"OTP Verified Successfully" , resetToken})
      }
   )
   //& 3- Reset New Password :
   export const resetPassword = catchError(
      async (req , res , next)=>{
         const { resetToken , newPassword } = req.body;
         const user = await userModel.findOne({
            resetToken,
            resetTokenExpiry: { $gt: new Date() },
         });

         if(!user) return next(new AppError("Invalid or expired token")) ; 

         user.password = newPassword;
         user.resetToken = null;
         user.resetTokenExpiry = null;
         user.passwordChangedAt = Date.now() ;
         await user.save()

         let codeHtml = ()=>{
            return `
               <p style="font-size:16px; font-weight:bold;">The new forgotten password has been changed. Please don't share this information with anyone and try again login now ! <span style="display:inline-block ;  padding:2px; letter-spacing: 2px; color:white;  background-color:rgb(143,84,201) ;font-size:18px;">${newPassword}</span> If you did not request a change of password, please ignore this email!</p>
            `
         }
         const subject =  "Your password has been changed. Please do not share this information"
         sendEmail(user.email , subject , codeHtml ) ;

         return res.json({message:"Password reset successfully" , newPassword })
      }
   )




//^ Generate QR Code :
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




//^ Login With Google Account :
//&  Login With Google :
export const loginWithGoogle = catchError(
   async (req, res) => {
      const email = req.user.emails[0].value ;
      const emailVerified = req.user.emails[0].verified ;
      
      let user = await userModel.findOne({email} ) ;
      if(!user){
         user = await userModel.create({
            name:req.user.displayName ,
            googleId:req.user.id ,
            email ,
            confirmedEmail:emailVerified
         })
      }else {
         user.googleId = req.user.id ;
         user.confirmedEmail = emailVerified ;
         await user.save() ;
      }

      const token = generateToken(user) ;


      // res.redirect(`https://eng-mahmoudothman.github.io/Fekrah_Medical_Front-End/#/LoginSuccessGoogle?token=${token}`);
      res.redirect(`${process.env.REDIRECT_URL_GOOGLE}/#/LoginSuccessGoogle?token=${token}`);
   }
)
