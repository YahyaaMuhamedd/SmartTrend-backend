import { Server } from "socket.io";

export function socketConnect(server){
      //& Socket io Connection :
      const io = new Server(server , {cors:"*"});


      let listNotification =  [] ;
      let count = 0 ;
      let onlineUsers =  [] ;
      const addNewUser = (email , role , socketId)=>{
         !onlineUsers.some((user)=>user.email === email) && onlineUsers.push({email , role , socketId})
      }

      const removeUser = (socketId)=>{
         onlineUsers = onlineUsers.filter((user)=> user.socketId !== socketId)
      }


      const removeNotification = (count)=>{
         listNotification = listNotification.filter((ele)=> ele.count !== count)
      }


      const getUser = ()=>{
         let userAdmin = onlineUsers.filter((ele)=>ele.role === "admin") ;
         return userAdmin
      }

      io.on("connection" , (socket)=>{
         //& Detected Socket Connection :
         console.log("Socket Connection ...");
         // console.log(socket.id);
         // io.emit("firstEvent" , "This it test !")


         socket.on("newUser" , ({email , role})=>{
            addNewUser(email , role , socket.id) ;
         })
         
         socket.on("all-Notification" , ()=>{
            const receiveUsers = getUser() ;
            receiveUsers.map((ele)=>{
               io.to(ele.socketId).emit("all-Notification" ,  listNotification)
            })
         })
         
         socket.on("sendNotification" , ({sender  , type})=>{
            count += 1
            listNotification.push({sender  , type , count}) ;
            
            const receiveUsers = getUser() ;
            receiveUsers.map((ele)=>{
               io.to(ele.socketId).emit("getNotification" , listNotification)
            })
         })
         
         socket.on("removeNotification" , (count)=>{
            removeNotification(count) ;

            const receiveUsers = getUser() ;
            receiveUsers.map((ele)=>{
               io.to(ele.socketId).emit("getNotification" , listNotification)
            })
         })

         socket.on("disconnect" , ()=>{
            console.log("Socket Not Connection !!") ;
            removeUser(socket.id)
         })
      })
}

