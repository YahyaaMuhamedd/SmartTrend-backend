
import expressSession from 'express-session';



export default function configGoogle(){
   return (
      expressSession({
         secret: process.env.SECRET_KEY , 
         resave: false,
         saveUninitialized: false,
         cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 يوم
      })
   )
}