import puppeteer from 'puppeteer';
import { generate_Date } from './generateDate_Time.js';
import path from 'path';


const date = generate_Date();

export let create_pdf = async (template, data, fileName) => {


   // Check Exist Docs Folder And Create Folder Docs When Not Exist :
   const destPath = path.resolve(`Docs/`)
   if(!fs.existsSync(destPath)){
      fs.mkdirSync( destPath , {recursive:true})
   }


   let fullName = `${fileName}.pdf`;
   // const browser = await puppeteer.launch();
   const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
   });

   const page = await browser.newPage();

   // Generate the HTML content from the template and data
   const content = template(data);

   // Set up the page content
   // await page.setContent(content);
   await page.setContent(content, { waitUntil: 'networkidle0' });


   // PDF options
   const options = {
      path: `./Docs/${fullName}`,
      format: 'A4',
      printBackground: true,
      margin: {
         top: '10px',
         bottom: '30px',
         left: '10px',
         right: '10px',
      },
      displayHeaderFooter: true,
      headerTemplate: `<div style="text-align: center; color:blue;">Email: Fekrah_Company@gmail.com</div>`,
      footerTemplate: `
         <div style="text-align: center; color: #444;">
            ${date} | Page <span class="pageNumber"></span> of <span class="totalPages"></span>
         </div>
      `,
   };

   // Create the PDF
   await page.pdf(options);

   // Close the browser
   await browser.close();

   let filePath = `${process.env.BASE_URL}pdf/${fullName}`;
   console.log("path pdf Ya Mahmoud", filePath);
   
   return filePath;
};




































// import { create } from 'pdf-creator-node';
// import { generate_Date } from './generateDate_Time.js';


// const date = generate_Date()

// export let create_pdf = ( res , template , data , fileName)=>{
//    var options = {
//       format: "A4",
//       orientation: "portrait",
//       border: "10px",
//       header: {
//          height: "50px",
//          contents: '<div style="text-align: center; color:blue;">Email: Fekrah_Company@gmail.com</div>'
//       },
//       footer: {
//          height: "30px",
//          contents: {
//             // first: "cover Page",
//             first: date,
//             // 2: 'Second page', // Any page number is working. 1-based index
//             default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
//             // last: 'Last Page'
//             // last: new Date()
//          }
//       }
//    };

//    let fullName = `${fileName}.pdf`

//    let  document = {
//       html: template(data),
//       data: {data},
//       path: `./Docs/${fullName}`,
//    };

//    let filePath = `${process.env.BASE_URL}pdf/${fullName}`
   
//    create(document, options) ;
//    return filePath ;
// }
