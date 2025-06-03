import { generate_Date } from "../services/generateDate_Time.js"

const date = generate_Date() ;

export const pdf_Report_data_contract_price = (data)=>{

   const total_Contract_Price = data?.orders.reduce((acc , entry)=>{
      return acc + entry.Contract_Price
   } , 0)

   return (
      `
      <!DOCTYPE html>
      <html>
         <head>
            <meta charset="utf-8" />      
            <style>
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
      
               .invoice-box table {
                  width: 100%;
                  line-height: inherit;
                  text-align: left;
               }
      
               .invoice-box table td {
                  padding: 5px;
                  vertical-align: top;
               }
      
               .invoice-box table tr td:nth-child(2) {
                  text-align: right;
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
                  text-align:center ;
                  font-size:10px ;
               }
      
               .invoice-box table tr.details td {
                  padding-bottom: 20px;
               }
      
               .invoice-box table tr.item td {
                  border-bottom: 1px solid #eee;
                  text-align:center ;
                  font-size:12px;
                  font-weight: bold;
               }
      
               .invoice-box table tr.item.last td {
                  border-bottom: none;
               }
      
               .invoice-box table tr.total td {
                  border-top: 2px solid #eee;
                  font-weight: bold;
                  text-align:center ;
                  font-size:16px
               }
      
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
               <table cellpadding="0" cellspacing="0">
                  <tr class="top">

                              <h1 style=" text-align: center ; "> TREND </h1>

      
                              <ul style="font-weight:bold;  list-style:none; margin-top:20px ;">
                                 <li>Created At:  ${date}</li>
                                 ${data.date?.start ? `<li>From   : ${data.date?.start.split("-").reverse().join("-")} <span style="margin-left:300px;"> To : ${data.date?.end ? data.date?.end.split("-").reverse().join("-")  : `Today ${date}`}</span> </li>` : ""}
                              </ul>

                  </tr>
                  <hr/>
      
                  <tr class="information">
                     <td colspan="2">
                        <table>

                           <tr>
                              <td>
                                 Company Name :${data?.company?.name}<br />
                              </td>
                           </tr>

                        </table>
                     </td>
                  </tr>

                  <tr class="heading">
                     <td>Number</td>
                     <td>Order Number</td>
                     <td>Invoice Number</td>
                     <td>Transform Number</td>
                     <td>Date</td>
                     <td>Contract Price</td>
                  </tr>
      
                  ${data.orders?.map((ele , index)=>`
                           <tr class="item">
                              <td>${index + 1}</td>
                              <td>${ele.order_Number}</td>
                              <td>${ele.invoice_number}</td>
                              <td>${ele.transform_number}</td>
                              <td>${new Date(ele.createdAtOrder).toString().slice(0 , 24)}</td>
                              <td>${Math.round(ele.Contract_Price)}</td>
                           </tr>
                        `
                  ).join(" ")}


                  <tr class="total heading">
                     <td>Total</td>
                     <td></td>
                     <td></td>
      
                     <td></td>      
                     <td> ${ Math.round(total_Contract_Price )}.00</td>
                     <td></td>
               </tr>
      
               </table>
            </div>
         </body>
      </html>
`
   )
}