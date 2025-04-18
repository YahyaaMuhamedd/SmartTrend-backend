
import { generate_Date } from "../services/generateDate_Time.js";


const date = generate_Date();


export let pdf_invoice = (data) => {
   return (
      `
      <!DOCTYPE html>
      <html>
         <head>
            <meta charset="utf-8" />
            <style>
               .invoice-box {
                  max-width: 800px;
                  margin: -100px auto 0px;
                  padding: 30px;
                  font-size: 14px;
                  line-height: 18px;
                  font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                  color: #555;
               }

               .invoice-box table {
                  width: 100%;
                  line-height: inherit;
                  text-align: left;
               }

               .invoice-box table td {
                  padding: 5px;
                  vertical-align: top;
               }

               .invoice-box img {
                  max-width: 150px;
                  margin-bottom: 20px;
               }

               .invoice-box table tr.top table td {
                  padding-bottom: 20px;
               }

               .invoice-box table tr.top table td.title {
                  font-size: 30px;
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

               .invoice-box table tr.item td {
                  border-bottom: 1px solid #eee;
               }

               .invoice-box table tr.total td:nth-child(2) {
                  border-top: 2px solid #eee;
                  font-weight: bold;
               }

               .signature {
                  margin-top: 40px;
                  text-align: center;
                  font-style: italic;
                  font-size: 12px;
                  line-height: 0px;
               }

               @media only screen and (max-width: 600px) {
                  .invoice-box table tr.top table td,
                  .invoice-box table tr.information table td {
                     width: 100%;
                     display: block;
                     text-align: center;
                  }
               }

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

               @page {
                  margin: 30px 10px;
               }

               body::before {
                  content: "";
                  display: block;
                  height: 100px;
               }

               @page :first {
                  margin-top: 10px;
               }

               body:first-of-type header {
                  display: none;
               }
            </style>
         </head>
         <body>

         <div class="invoice-box">

            <!-- شعار الشركة -->
            <img src="https://fekrahmedicalback-end-production-c89a.up.railway.app/images/logo.jpg" alt="Logo" style="max-width: 150px; margin-bottom: 20px;" />

            <table cellpadding="0" cellspacing="0">
               <tr class="top">
                  <h1 style=" text-align: center ; "> Fekrah Medical </h1>

                  <ul style="font-weight:bold; list-style:none;">
                     <li>Invoice Num: ${data.invoice_number}</li>
                     <li>Created_At: ${date}</li>
                     <li>Company Name: ${data.company.name}</li>
                     <li>Branch Name: .............</li>
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
            
            <div class="signature">
               <p>Fekrah Medical - www.fekrahmedical.com</p>
               <p>Address: [Your Company Address]</p>
               <p>Authorized Signature</p>
               <p>____________________</p>
            </div>

         </body>
      </html>
      `
   );
};











export let temp_test = (data) => {
   return (`
      <!DOCTYPE html>
      <html>
         <head>
            <meta charset="utf-8" />
            
         </head>
         <body>


         <div class="invoice-box">

            <!-- أول صفحة -->
            <img src="/Docs/images/logo.jpg" class="logo" alt="Logo" />

            <h1 style="text-align: center;">Fekrah Medical</h1>

            <ul>
               <li>Invoice Num: 0000</li>
               <li>Created_At: ${data.date || "2025-04-17"}</li>
               <li>Company Name: 123456</li>
               <li>Branch Name: العياط</li>
            </ul>

            <hr/>

            <table>
               <tr>
                  <td>
                     Patient Name : محمود عثمان ابو بكر <br />
                     Patient Street : cairo <br />
                     Patient City : cairo <br />
                     ******** : ****************
                  </td>
                  <td>
                     Patient Phone : 0112323234 <br />
                     User Name: Mahmoud Othman <br />
                     User email : email.gmail.com <br />
                     ######### : ###################
                  </td>
               </tr>
            </table>

            <br />

            <table>
               <tr class="heading">
                  <td>Payment Method</td>
                  <td>Cash</td>
               </tr>
               <tr class="item">
                  <td><strong>Check Total Price After Discount</strong></td>
                  <td><strong>1232 EGP</strong></td>
               </tr>

               <tr class="heading">
                  <td>Item</td>
                  <td>Price</td>
               </tr>

               <!-- البيانات -->
               ${Array(30).fill(`<tr class="item"><td>mahmoud Othman</td><td>132.00 EGP</td></tr>`).join('')}

               <tr class="total">
                  <td>Total Price</td>
                  <td>Total: ${data.total || '2343.00'} EGP</td>
               </tr>
            </table>




         </div>
         </body>
      </html>
   `);
};

