import jwt from "jsonwebtoken" ;




export default function  generateToken(user){
   const token = jwt.sign(
      {
         _id:user._id , 
         name:user.name , 
         gender:user.gender ,  
         phone: user.phone , 
         email:user.email , 
         role:user.role , 
         birthDay:user.birthDay , 
         age:user.age , 
         imgCover:user.imgCover
      } , 
      process.env.SECRET_KEY , 
      {expiresIn:process.env.TOKEN_EXPIRATION} // expired Token After 2 hours or ==> expiresIn:"2h" 
   ) ;
   return token ;
}