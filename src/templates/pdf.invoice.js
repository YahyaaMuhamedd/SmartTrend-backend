// import { generate_Date } from "../services/generateDate_Time.js";
// import path from 'path';
// import fs from 'fs';

// const date = generate_Date();



//    // بناء المسار الديناميكي لشعار الشركة
//    // const logoPath = path.resolve('src', 'images', 'logo.jpg');
//    const logoPath = path.resolve(new URL(import.meta.url).pathname, 'src', 'images', 'logo.jpg');

//    // التأكد من وجود الملف
//    if (fs.existsSync(logoPath)) {
//       console.log("Path Logo", logoPath);
//    } else {
//       console.log("Invalid Path");
//    }

// export let pdf_invoice = (data) => {
//    return (
//       `
//       <!DOCTYPE html>
//       <html>
//          <head>
//             <meta charset="utf-8" />
//             <style>
//                /* الفاتورة */
//                .invoice-box {
//                   max-width: 800px;
//                   margin: auto;
//                   padding: 30px;
//                   border: 1px solid #eee;
//                   box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
//                   font-size: 16px;
//                   line-height: 24px;
//                   font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
//                   color: #555;
//                }

//                /* جدولة البيانات */
//                .invoice-box table {
//                   width: 100%;
//                   line-height: inherit;
//                   text-align: left;
//                }

//                .invoice-box table td {
//                   padding: 5px;
//                   vertical-align: top;
//                }

//                /* الشعار */
//                .invoice-box img {
//                   max-width: 150px;
//                   margin-bottom: 20px;
//                }

//                .invoice-box table tr.top table td {
//                   padding-bottom: 20px;
//                }

//                .invoice-box table tr.top table td.title {
//                   font-size: 45px;
//                   line-height: 45px;
//                   color: #333;
//                }

//                .invoice-box table tr.information table td {
//                   padding-bottom: 40px;
//                }

//                .invoice-box table tr.heading td {
//                   background: #eee;
//                   border-bottom: 1px solid #ddd;
//                   font-weight: bold;
//                }

//                .invoice-box table tr.details td {
//                   padding-bottom: 20px;
//                }

//                .invoice-box table tr.item td {
//                   border-bottom: 1px solid #eee;
//                }

//                .invoice-box table tr.item.last td {
//                   border-bottom: none;
//                }

//                .invoice-box table tr.total td:nth-child(2) {
//                   border-top: 2px solid #eee;
//                   font-weight: bold;
//                }

//                /* الفوتر الخاص بكل صفحة */
//                @page {
//                   margin: 0;
//                   padding: 0;
//                   size: auto;
//                }

//                .footer {
//                   position: fixed;
//                   bottom: 0;
//                   width: 100%;
//                   text-align: center;
//                   font-size: 14px;
//                   padding: 10px;
//                   background: #f8f8f8;
//                   border-top: 1px solid #eee;
//                }

//                .footer p {
//                   margin: 0;
//                   padding: 5px;
//                   color: #333;
//                }

//                /* التوقيع */
//                .signature {
//                   margin-top: 40px;
//                   text-align: center;
//                   font-style: italic;
//                   font-size: 16px;
//                }

//                /* الهوامش */
//                @media only screen and (max-width: 600px) {
//                   .invoice-box table tr.top table td {
//                      width: 100%;
//                      display: block;
//                      text-align: center;
//                   }

//                   .invoice-box table tr.information table td {
//                      width: 100%;
//                      display: block;
//                      text-align: center;
//                   }
//                }

//                /** RTL **/
//                .invoice-box.rtl {
//                   direction: rtl;
//                   font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
//                }

//                .invoice-box.rtl table {
//                   text-align: right;
//                }

//                .invoice-box.rtl table tr td:nth-child(2) {
//                   text-align: left;
//                }
//             </style>
//          </head>
//          <body>

//          <div class="invoice-box">

//             <!-- شعار الشركة -->
//             <img src="/Docs/images/logo.jpg" alt="Logo" style="max-width: 150px; margin-bottom: 20px;" />

//             <table cellpadding="0" cellspacing="0">
//                <tr class="top">
//                   <h1 style=" text-align: center ; "> Fekrah Medical </h1>

//                   <ul style="font-weight:bold; list-style:none;">
//                      <li>Invoice Num: 0000</li>
//                      <li>Created_At: ${date}</li>
//                      <li>Company Name: 123456</li>
//                      <li>Branch Name: العياط</li>
//                   </ul>
//                </tr>
//                <hr/>

//                <tr class="information">
//                   <td colspan="2">
//                      <table>
//                         <tr>
//                            <td>
//                               Patient Name : محمود عثمان ابو بكر <br />
//                               Patient Street : cairo <br />
//                               Patient City :cairo <br />
//                               ******** : ****************
//                            </td>
   
//                            <td>
//                               Patient Phone : 0112323234 <br />
//                               User Name: Mahmoud Othman <br />
//                               User email : email.gmail.com <br />
//                               ######### : ###################
//                            </td>
//                         </tr>
//                      </table>
//                   </td>
//                </tr>
      
//                <tr class="heading">
//                   <td>Payment Method</td>
//                   <td>Cash</td>
//                </tr>
      
//                <tr class="details">
//                   <td style="font-weight:bold;">Check Total Price After Discount</td>
//                   <td style="font-weight:bold;"> 1232 EGP</td>
//                </tr>
      
//                <tr class="heading">
//                   <td>Item</td>
//                   <td>Price</td>
//                </tr>
      
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               
//                <tr class="item">
//                   <td>mahmoud Othman</td>
//                   <td>132.00 EGP</td>
//                </tr>
               












//                <tr class="total">
//                   <td style="font-weight:bold;">Total Price</td>
//                   <td>Total:  2343,00 EGP</td>
//                </tr>

//             </table>
            
//             <!-- التوقيع -->
//             <div class="signature">
//                <p>Authorized Signature</p>
//                <p>____________________</p>
//             </div>

//          </div>
         
//          <!-- الفوتر الخاص بكل صفحة -->
//          <div class="footer">
//             <p>Fekrah Medical - www.fekrahmedical.com</p>
//             <p>Address: [Your Company Address]</p>
//          </div>

//          </body>
//       </html>
//       `
//    );
// };























































import { generate_Date } from "../services/generateDate_Time.js";
import path from 'path';
import fs from 'fs';

const date = generate_Date();



   // بناء المسار الديناميكي لشعار الشركة
   const logoPath = path.resolve('src', 'images', 'logo.jpg');

   // التأكد من وجود الملف
   if (fs.existsSync(logoPath)) {
      console.log("Path Logo", logoPath);
   } else {
      console.log("Invalid Path");
   }

export let pdf_invoice = (data) => {
   return (
      `
      <!DOCTYPE html>
      <html>
         <head>
            <meta charset="utf-8" />
            <style>
               /* الفاتورة */
               .invoice-box {
                  max-width: 800px;
                  margin: auto;
                  padding: 30px;
                  border: 1px solid #eee;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                  font-size: 16px;
                  line-height: 24px;
                  font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                  color: #555;
               }

               /* جدولة البيانات */
               .invoice-box table {
                  width: 100%;
                  line-height: inherit;
                  text-align: left;
               }

               .invoice-box table td {
                  padding: 5px;
                  vertical-align: top;
               }

               /* الشعار */
               .invoice-box img {
                  max-width: 150px;
                  margin-bottom: 20px;
               }

               .invoice-box table tr.top table td {
                  padding-bottom: 20px;
               }

               .invoice-box table tr.top table td.title {
                  font-size: 45px;
                  line-height: 45px;
                  color: #333;
               }

               .invoice-box table tr.information table td {
                  padding-bottom: 40px;
               }

               .invoice-box table tr.heading td {
                  background: #eee;
                  border-bottom: 1px solid #ddd;
                  font-weight: bold;
               }

               .invoice-box table tr.details td {
                  padding-bottom: 20px;
               }

               .invoice-box table tr.item td {
                  border-bottom: 1px solid #eee;
               }

               .invoice-box table tr.item.last td {
                  border-bottom: none;
               }

               .invoice-box table tr.total td:nth-child(2) {
                  border-top: 2px solid #eee;
                  font-weight: bold;
               }

               /* الفوتر الخاص بكل صفحة */
               @page {
                  margin: 0;
                  padding: 0;
                  size: auto;
               }

               .footer {
                  position: fixed;
                  bottom: 0;
                  width: 100%;
                  text-align: center;
                  font-size: 14px;
                  padding: 10px;
                  background: #f8f8f8;
                  border-top: 1px solid #eee;
               }

               .footer p {
                  margin: 0;
                  padding: 5px;
                  color: #333;
               }

               /* التوقيع */
               .signature {
                  margin-top: 40px;
                  text-align: center;
                  font-style: italic;
                  font-size: 16px;
               }

               /* الهوامش */
               @media only screen and (max-width: 600px) {
                  .invoice-box table tr.top table td {
                     width: 100%;
                     display: block;
                     text-align: center;
                  }

                  .invoice-box table tr.information table td {
                     width: 100%;
                     display: block;
                     text-align: center;
                  }
               }

               /** RTL **/
               .invoice-box.rtl {
                  direction: rtl;
                  font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
               }

               .invoice-box.rtl table {
                  text-align: right;
               }

               .invoice-box.rtl table tr td:nth-child(2) {
                  text-align: left;
               }
            </style>
         </head>
         <body>

         <div class="invoice-box">

            <!-- شعار الشركة -->
            <img src="file://${logoPath}" alt="Logo" style="max-width: 150px; margin-bottom: 20px;" />

            <table cellpadding="0" cellspacing="0">
               <tr class="top">
                  <h1 style=" text-align: center ; "> Fekrah Medical </h1>

                  <ul style="font-weight:bold; list-style:none;">
                     <li>Invoice Num: ${data.invoice_number}</li>
                     <li>Created_At: ${date}</li>
                     <li>Company Name: ${data.company.name}</li>
                     <li>Branch Name: ${data.branch_Area}</li>
                  </ul>
               </tr>
               <hr/>

               <tr class="information">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td>
                              Patient Name : ${data.patient_Name} <br />
                              Patient Street : ${data.shipping_Address.street} <br />
                              Patient City : ${data.shipping_Address.city} <br />
                              ******** : ****************
                           </td>
   
                           <td>
                              Patient Phone : ${data.patient_Phone} <br />
                              User Name: ${data.user?.name} <br />
                              User email : ${data.user?.email} <br />
                              ######### : ###################
                           </td>
                        </tr>
                     </table>
                  </td>
               </tr>
      
               <tr class="heading">
                  <td>Payment Method</td>
                  <td>${data.payment_Type}</td>
               </tr>
      
               <tr class="details">
                  <td style="font-weight:bold;">Check Total Price After Discount</td>
                  <td style="font-weight:bold;"> ${data.total_Price_After_Discount} EGP</td>
               </tr>
      
               <tr class="heading">
                  <td>Item</td>
                  <td>Price</td>
               </tr>

               ${data.orderItems.map((ele) => `
                  <tr class="item">
                     <td>${ele?.test.name}</td>
                     <td>${Math.trunc(ele.priceAfterDiscount) == ele.priceAfterDiscount ? `${ele.priceAfterDiscount}.00 EGP ` : `${ele.priceAfterDiscount} EGP `}</td>
                  </tr>
               `).join(" ")}

               <tr class="total">
                  <td style="font-weight:bold;">Total Price</td>
                  <td>Total: ${Math.trunc(data.total_Price_After_Discount) == data.total_Price_After_Discount ? `${data.total_Price_After_Discount}.00 EGP ` : `${data.total_Price_After_Discount} EGP `}</td>
               </tr>

            </table>
            
            <!-- التوقيع -->
            <div class="signature">
               <p>Authorized Signature</p>
               <p>____________________</p>
            </div>

         </div>
         
         <!-- الفوتر الخاص بكل صفحة -->
         <div class="footer">
            <p>Fekrah Medical - www.fekrahmedical.com</p>
            <p>Address: [Your Company Address]</p>
         </div>

         </body>
      </html>
      `
   );
};

