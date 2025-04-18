import { userModel } from "../../../DataBase/models/user.model.js"
import cloudinary from "../../services/cloudinary.config.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import jwt from "jsonwebtoken";

import fs from "fs";
import path from "path";





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
      const users = await apiFeature.mongooseQuery.select("name phone role email birthDay age imgCover addresses confirmedEmail isBlocked");

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
      const date = new Date();
      const day = (date.getDate()).toString().length == 1 ? `0${(date.getDate() - 1)}` :  (date.getDate() -1 ) ;
      const month = (date.getMonth()).toString().length == 1 ? `0${(date.getMonth() + 1)}` :  (date.getMonth() + 1) ;
      const year = date.getFullYear() ;

      const todayDate = `${year}-${month}-${day}T00:00:00Z` ;



      //! Get All Payment Orders Today's :
      const todayNewUsers = await userModel.find({
         createdAt:
            {
               $gte:todayDate ,
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

      //^ Delete Image From cloudinary:
      // if(user.imgCover?.public_id){
      //    //! Delete image From Cloudinary :
      //    await cloudinary.uploader.destroy(user.imgCover.public_id);
         
      //    //! Delete Folder image From Cloudinary :
      //    await cloudinary.api.delete_folder(`Fekrah/users/imgCover/${user.name}`)
      // }


      //^ Delete Image from Server Disk Local :
      if(user.imgCover){
         const fileName = "Uploads/users/" + path.basename(user.imgCover)
         fs.unlinkSync(path.resolve(fileName))
      }

      !user && next(new AppError("Not Found User" , 404))
      user && res.json({message:"success" , user})
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

      if((req.file.size > +process.env.UPLOAD_IMAGE_SIZE)){
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




//& Deleted All Prices :
export const deletedAllUsers = catchError(
   async(req , res , next)=>{
      // const users = await userModel.deleteMany();
      res.json({message:"Successfully Deleted All Users"})
   }
)