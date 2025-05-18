import { generate_Date } from "../services/generateDate_Time.js";




const date = generate_Date()
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

               .attention{
                  font-weight:bold;
                  margin:10px 0px ;
               }

               .endDate {
                  font-size: 10px ;
               }
            </style>
         </head>
         <body>

         <div class="invoice-box">

            <!-- شعار الشركة -->
            <img src="${process.env.BASE_URL}/images/newLogo.png" alt="Logo" style="max-width: 150px; margin-bottom: 20px ;" />

            <table cellpadding="0" cellspacing="0">
               <tr class="top">
                  <h1 style=" text-align: center ; "> SMART TREND </h1>

                  <ul style="font-weight:bold; list-style:none;">
                     <li>Invoice Number: ${data.invoice_number}</li>
                     <li>Order Number: ${data.order_Number}</li>
                     <li>Company Name: ${data.company.name}</li>
                     <li>Created At: ${new Date(data.createdAt).toISOString().split('T')[0] }</li>
                  </ul>
               </tr>
               <hr/>

               <tr class="information">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td>
                              Patient Information :- <br />
                              Patient Name : ${data.patient_Name} <br />
                              Patient Street : ${data.shipping_Address.street?data.shipping_Address.street:"لا يوجد"} <br />
                              Patient City : ${data.shipping_Address.city?data.shipping_Address.city:"لا يوجد"} <br />
                              Patient Phone : ${data.patient_Phone? data.patient_Phone :"لا يوجد"} <br />
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
                  <td style="font-weight:bold;">Check Total Price</td>
                  <td style="font-weight:bold;"> 00.00 EGP</td>
               </tr>
      
               <tr class="heading">
                  <td>Item</td>
                  <td>Price</td>
               </tr>

               ${data.orderItems.map((ele) => `
                  <tr class="item">
                     <td>${ele?.test.name}</td>
                     <td>00.00 EGP</td>
                  </tr>
               `).join(" ")}

               <tr class="total">
                  <td style="font-weight:bold;">Total Price</td>
                  <td>Total: 00.00 EGP </td>
               </tr>

            </table>
            
            <div class="signature">
               <p>TREND - www.trend-sm.com</p>
               <p>Address: Cairo</p>
               <p>Authorized Signature</p>
               <p>________SMART_TREND________</p>
               </div>
               
            <div class="attention">
               <h3 >Attention!</h3>
               <strong class="">The validity of this invoice is 30 days from the time the order is created</strong>
            </div>

            <p class="endDate"> Print At :${date}</p>

         </body>
      </html>
      `
   );
};
