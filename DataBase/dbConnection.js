

import mongoose from "mongoose";



//& Data Base Local Connection :
export const dbConnection = async ()=>{
   await mongoose.connect(process.env.URL_CONNECTION_DB_OFFLINE ).then(()=>{
      console.log("dbConnection ....");
   }).catch((error)=>{
      console.log("Fail dbConnection ! ");
   })
}












// // & Data Base Online Connection By Atlas :
// export const dbConnection = async ()=>{
//    await mongoose.connect(process.env.URL_CONNECTION_DB_ONLINE_ATLAS).then(()=>{
//       console.log("dbConnect Online ...." );
//    }).catch((error)=>{
//       // console.log("Fail dbConnection ! " , error);
//       console.log("Fail dbConnection Online ! " );
//    })
// }






