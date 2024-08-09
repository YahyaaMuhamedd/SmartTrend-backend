
import { create } from 'pdf-creator-node';
import { v4 as uuid } from 'uuid';
import { generate_Date } from './generateDate_Time.js';


const date = generate_Date()

export let create_pdf = ( res , template , data , fileName)=>{
   var options = {
      format: "A4",
      orientation: "portrait",
      border: "10px",
      header: {
         height: "50px",
         contents: '<div style="text-align: center; color:blue;">Email: Fekrah_Company@gmail.com</div>'
      },
      footer: {
         height: "30px",
         contents: {
            // first: "cover Page",
            first: date,
            // 2: 'Second page', // Any page number is working. 1-based index
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            // last: 'Last Page'
            // last: new Date()
         }
      }
   };

   let fullName = `${fileName}.pdf`

   let  document = {
      html: template(data),
      data: {},
      path: `./Docs/${fullName}`,
   };

   let filePath = `${process.env.BASE_URL}pdf/${fullName}`
   
   create(document, options) ;
   return filePath ;
      // .then((result) => {
      //    // return filePath ;
      //    // res.json({path:filePath})
      //    // res.send(`<a download href='${filePath}'>Download</a>`)
      // }).catch((error) => {
      //    console.error(error)
      // });
}
