import { userModel } from "../../../DataBase/models/user.model.js"
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import jwt from "jsonwebtoken";

import fs from "fs";
import path from "path";
import { orderModel } from "../../../DataBase/models/order.model.js";
import { prescriptionModel } from "../../../DataBase/models/prescription.model.js";
import { getDateRange } from "../../services/getDateRange.js";

const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000;




//& Get All Users :
export const getAllUser = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;
      let result = await userModel.find();

      //^ Merge Params
      let filterObj = {};

      if(filter == "blocked"){
         filterObj = {isBlocked:true}
      }else if (filter == "active"){
         filterObj = {isBlocked:false}
      }


      let apiFeature = new ApiFeature(userModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const users = await apiFeature.mongooseQuery.select("name phone role email birthDay age imgCover addresses confirmedEmail isBlocked createdAt updatedAt");

      if(!users.length) return next(new AppError("Users is Empty" , 404))

      let currentPag = apiFeature.pageNumber ;
      let numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      let limit = apiFeature.limit  ;
      let nextPage = numberOfPages - apiFeature.pageNumber ;
      let prevPage = (numberOfPages - nextPage) - 1 ;

      let metadata = {
         currentPag: currentPag ,
         numberOfPages: numberOfPages || 1 ,
         limit: limit ,
         }

         if(nextPage >  numberOfPages  && nextPage != 0){
            metadata.nextPage  = nextPage
         }
         if(currentPag <=  numberOfPages  && prevPage != 0 ){
            metadata.prevPage  = prevPage
         }
      // res.json({message:"success" , results:users.length ,  metadata: metadata ,  users }) ;
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  users}) ;
   }
)



//& Get User Count :
export const getUserCount = catchError(
   async(req , res , next)=>{

      //! All Users :
      const allUsers = await userModel.find();

      //! Blocked Users :
      const blockedUser = await userModel.find({isBlocked:true});

      //! Active Users :
      const activeUser = await userModel.find({isBlocked:false });

      //& Get date By Specific Formate 0000-00-00 :

      const startDay = getDateRange().start ;
      const endDay = getDateRange().end ;


      //! Get All Payment Orders Today's :
      const todayNewUsers = await userModel.find({
         creationTimeAt:
            {
               $gte:startDay , $lte:endDay
            }
      });

      res.json({message:"success" , user_Data :{
         users:allUsers.length ,
         blockedUser:blockedUser.length ,
         activeUser:activeUser.length ,
         todayNewUsers:todayNewUsers.length ,
         NewUsers: todayNewUsers
      }}) ;
   }
)



//& Add User :
export const addUser = catchError(
   async (req , res , next)=>{
      const {name , role , phone , email , birthDay , password} = req.body ;

     //& Calculation Age From BirthDay :
      let age = 0 ;
      let nowAge = (birthDay)=>{
         let dateNow = new Date()
         let birth = new Date(birthDay)
         let diff = dateNow - birth
         let age = Math.floor(diff/1000/60/60/24/365);
         return age
      }
      age = nowAge(req.body.birthDay)

      const user = await userModel.create({name , role , phone , age , birthDay , email  , password}) ;

      !user && next(new AppError("User Not Added" , 404))
      user && res.json({message:"success", user})
   }
)



//& Get Single User :
export const getSingleUser = catchError(
   async(req , res , next)=>{
      const user = await userModel.findById(req.params?.id) ;
      !user && next(new AppError("User Not Found" , 404))
      user && res.json({message:"success" , user})
   }
)



//& Update User :
export const updateUser = catchError(
   async(req , res , next)=>{
      const {name , phone , email , birthDay} = req.body ;

      const user = await userModel.findById(req.user._id)
      if(!user) return next(new AppError("User Not Found" , 404)) ;
      
      const userExist = await userModel.findOne({email}) ;      
      if(userExist && user.email !== email) return next(new AppError("Email Already Exist" , 401))

      //& Calculation Age From BirthDay :
      let age = 0 ;
      let nowAge = (birthDay)=>{
         let dateNow = new Date()
         let birth = new Date(birthDay)
         let diff = dateNow - birth
         let age = Math.floor(diff/1000/60/60/24/365);
         return age
      }
      age = nowAge(birthDay) ;
      if(name) user.name = name ;
      if(phone) user.phone = phone ;
      if(email) user.email = email ;
      if(birthDay) user.birthDay = birthDay ;
      user.age = age ;
      
      await user.save()

      const userUpdated = await userModel.findById(req.user._id).select("-_id name role  phone birthDay email  age imgCover") ;

      !userUpdated &&  next(new AppError("User Not Found After Updated" , 404)) ;
      userUpdated &&  res.json({message:"success" , updateUser:userUpdated})
   }
)


//& Update User :
export const completeUserInfoWhenLoginGoogle = catchError(
   async(req , res , next)=>{
      const {phone , birthDay , password} = req.body ;

      const user = await userModel.findById(req.user._id)
      if(!user) return next(new AppError("User Not Found" , 404)) ;
      
      //& Calculation Age From BirthDay :
      let age = 0 ;
      let nowAge = (birthDay)=>{
         let dateNow = new Date()
         let birth = new Date(birthDay)
         let diff = dateNow - birth
         let age = Math.floor(diff/1000/60/60/24/365);
         return age
      }
      age = nowAge(birthDay) ;
      if(phone) user.phone = phone ;
      if(birthDay) user.birthDay = birthDay ;
      if(password) user.password = password ;
      user.age = age ;
      await user.save() ;


      const token = jwt.sign(
         {_id:user._id , name:user.name , phone: user.phone , email:user.email , role:user.role , birthDay:user.birthDay , age:user.age , imgCover:user.imgCover} , 
         process.env.SECRET_KEY , 
         {expiresIn:process.env.TOKEN_EXPIRATION} // expired Token After 2 hours or ==> expiresIn:"2h" 
      ) 

      res.json({message:"success" , token})
   }
)



//& Update User Role :
export const updateUserRole = catchError(
   async(req , res , next)=>{
      const {role} = req.body ;
      const {id} = req.params ;

      const user = await userModel.findByIdAndUpdate(id , {role} , {new:true}) ;

      !user &&  next(new AppError("User Not Found" , 404))
      user && res.json({message:"success" , updateUser:user})
   }
)



//& Delete User :
export const deleteUser = catchError(
   async(req , res , next)=>{
      const user = await userModel.findByIdAndDelete(req.params.id) ;
      if(!user) return next(new AppError("User Not Exist" , 404)) ;

      //^ Delete Image from Server Disk Local :
      if(user.imgCover){
         const fileName = "Uploads/users/" + path.basename(user.imgCover)
         if (fs.existsSync(path.resolve(fileName))) {
            fs.unlinkSync(path.resolve(fileName))
         }
      }


      //^ Delete all invoices, transform and  prescription for this user :
      const orders = await orderModel.find({user:req.params.id}) ;
      if(!orders.length > 0) return next(new AppError("Orders is Empty" , 404)) ;
      
      const prescriptionList = await prescriptionModel.find({createdBy:req.params.id}) ;
      if(!prescriptionList.length > 0) return next(new AppError("Prescription is Empty" , 404)) ;


      //^ Delete order files :
      for (const order of orders) {
         if (order.invoice_pdf) {
            try {
               const fileName = "Docs/" + path.basename(order.invoice_pdf)
               if (fs.existsSync(path.resolve(fileName))) {
                  fs.unlinkSync(path.resolve(fileName))
               }
            } catch (err) {
               console.log("Invoice file not found or already deleted:", fileName);
               return next(new AppError("Invoice file not found or already deleted" , 404)) ;
            }
         }

         if (order.transform_pdf) {
            try {
               const fileName = "Docs/" + path.basename(order.transform_pdf)
               if (fs.existsSync(path.resolve(fileName))) {
                  fs.unlinkSync(path.resolve(fileName))
               }
            } catch (err) {
               console.log("Transform file not found or already deleted:", fileName);
               return next(new AppError("Transform file not found or already deleted" , 404)) ;
            }
         }
      }




      //^ Delete prescription files :
      for (const prescription of prescriptionList) {
         if (prescription.image) {
            try {
               const fileName =  "Uploads/Prescription/" + path.basename(prescription.image)
               if (fs.existsSync(path.resolve(fileName))) {
                  fs.unlinkSync(path.resolve(fileName))
               }
            } catch (err) {
               console.log("Prescription image not found or already deleted:", fileName);
               return next(new AppError("Prescription image not found or already deleted" , 404)) ;
            }
         }
      }

      const deletedOrders = await orderModel.deleteMany({user:req.params.id}) ;
      const deletedPrescription = await prescriptionModel.deleteMany({createdBy:req.params.id}) ;

      res.json({message:"success" , user})
   }
)


//& Blocked Account User :
export const blockUser = catchError(
   async(req , res , next)=>{
      if(req.query.block){
         const user = await userModel.findByIdAndUpdate(req.params.id , {isBlocked:req.query.block} , {new:true}) ;
         if(!user) return next(new AppError("User Not Found" , 404))
         return res.json({message:"success" , user})
      }
   }
)


//& change ImgCover :
export const changeImgCover = catchError(
   async(req , res , next)=>{
      if(!req.file) return next(new AppError("Please Choose image Cover" , 404))

      if((req.file.size > uploadImageSize)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      const imgCover = req.file.filename ;

      const user = await userModel.findByIdAndUpdate(req.user._id , {imgCover}) ;
      if(!user) return  next(new AppError("user Not Found", 404) ) ;
      
      //! Delete Image from Server Disk :
      if(user.imgCover){
      const destPath = path.resolve(`Uploads/users/${path.basename(user.imgCover)}`)
      if(fs.existsSync(destPath)){
         fs.unlinkSync(path.resolve(destPath))
      }


         // const fileName = "Uploads/users/" + path.basename(user.imgCover)
         // fs.unlinkSync(path.resolve(fileName))
      }
      
      const newUser = await userModel.findById(req.user._id).select("_id name role  phone birthDay email  age imgCover") ;
      
      const token = jwt.sign( 
         {_id:newUser._id , name:newUser.name ,  role:newUser.role ,  phone:newUser.phone ,  birthDay:newUser.birthDay ,  email:newUser.email ,  age:newUser.age , imgCover:newUser.imgCover} 
         , process.env.SECRET_KEY , {expiresIn:process.env.TOKEN_EXPIRATION}); // expired Token After 1 hours 

      !newUser && next(new AppError("User Not Found After Change Cover", 404) ) ;
      newUser &&  res.json({message:"success" , token }) ;
   }

)

