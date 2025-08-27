
import path from "path";
import fs from "fs";
import XLSX  from "xlsx" ;
import ExcelJS from 'exceljs';


// ! Not Appear id Into Object in Excel Sheet :
export const exportDataToExcelWithoutId =  async(data) =>{

   if (data && data.length > 0) {
      // تحويل البيانات إلى ورقة Excel
      const worksheet =  XLSX.utils.json_to_sheet(data);

      // إنشاء ملف Excel
      const workbook = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
         
         // حفظ الملف على الجهاز
         const filePath = path.resolve('Uploads/excel/data.xlsx');
         if (!fs.existsSync(filePath)) {
               fs.mkdirSync(filePath, { recursive: true });
            }
            XLSX.writeFile(workbook , filePath);         
         console.log('Data exported to Excel successfully!');
      return filePath ; // إرجاع المسار الكامل للملف
   } else {
      console.log('No data to export.');
   }
}


// ! Appear id Into Object in Excel Sheet :
export const exportDataToExcelWithinId = async (data) => {
   if (!data || data.length === 0) {
      console.log('🚫 No data to export.');
      return null;
   }

   // إنشاء ملف Excel جديد وورقة بيانات
   const workbook = new ExcelJS.Workbook();
   const worksheet = workbook.addWorksheet('Sheet1');

   // تعيين الأعمدة بناءً على مفاتيح أول عنصر
   worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key: key,
      width: 20
   }));

   // (id) إضافة الصفوف وحزف علامة التنصيص فى اى دى
   data.forEach(item =>{
      item._id = item._id.toString() ;
      worksheet.addRow(item) ;
   });

   // تحضير المسار
   const dirPath = path.resolve('Uploads/excel');
   if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
   }

   const filePath = path.join(dirPath, `data-${Date.now()}.xlsx`);
   await workbook.xlsx.writeFile(filePath);

   console.log('✅ Excel file created at:', filePath);
   return `${process.env.BASE_URL}/excel/data-${Date.now()}.xlsx`;
   // return filePath;
};








//! Create Excel Sheet From Database :
// فانكشن فورمات للهيدر
function formatHeader(key) {
   return key
      .replace(/[_-]/g, " ") // شيل "_" أو "-"
      .replace(/\w\S*/g, (txt) => {
         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
   );
} ;


// فانكشن بتعمل اكسيل من الداتا
export const exportExcel = async(data , colWidth , fileName , selectedFields)=> {
   const workbook = new ExcelJS.Workbook();
   const worksheet = workbook.addWorksheet("Orders");

   
   if (!data || data.length === 0) {
      throw new Error("مفيش داتا!");
   }




   // 1. استخدام selectedFields كـ هيدر---------------------- 
   const headers = selectedFields.map((key) => formatHeader(key));
   worksheet.addRow(headers);



   // فورمات للهيدر----------------------
   worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
         type: "pattern",
         pattern: "solid",
         fgColor: { argb: "9370DB" }, // بنفسجى
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
   });






   // 2. إضافة الصفوف من الداتا---------------------- 
   let rowIndex = 2;
   for (const doc of data) {
      const rowValues = selectedFields.map((key) => {
         if (doc[key] instanceof Date) {
            return doc[key]; // خليه تاريخ/وقت
         }
         return doc[key] ?? "";
      });
      const row = worksheet.addRow(rowValues);
      // فورمات الصفوف
      row.eachCell((cell, colNumber) => {
         cell.alignment = { horizontal: "center", vertical: "middle" };

         // لو العمود ده تاريخ/وقت
         if (doc[selectedFields[colNumber - 1]] instanceof Date) {
            cell.numFmt = "dd/mm/yyyy    hh:mm:ss"; 
            // تنسيق اليوم/الشهر/السنة + الساعة:دقيقة:ثانية
         }

         // zebra style خلفية كل صف وصف
         if (rowIndex % 2 === 0) {
            cell.fill = {
               type: "pattern",
               pattern: "solid",
               fgColor: { argb: "FFF2F2F2" },
            };
         } else {
            cell.fill = {
               type: "pattern",
               pattern: "solid",
               fgColor: { argb: "FFFFFFFF" },
            };
         }
      });
      rowIndex++;
   }






   // 3. تثبيت عرض الأعمدة  ------------------------
   worksheet.columns.forEach((col) => {
      col.width = colWidth; // عرض ثابت
   });





   // 4. حفظ الملف ----------------------
   const destPath = path.resolve(`Docs/`)
   if(!fs.existsSync(destPath)){
      fs.mkdirSync( destPath , {recursive:true})
   }

   // المسار النهائي للملف
   const filePath = path.join(destPath , fileName);

   await workbook.xlsx.writeFile(filePath);
   // console.log(`✅ الملف اتكتب: ${filePath}`);
   return fileName;
}

