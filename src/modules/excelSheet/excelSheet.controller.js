import { Collections } from "../../handlers/importCollections.js" ;
import { exportDataToExcelWithinId } from "../../services/exportExcel.js" ;
import { importExcelData } from "../../services/importExcel.js" ;
import { AppError } from "../../utilities/AppError.js" ;
import { catchError } from "../../utilities/catchError.js" ;


const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000 ;





//& Add Excel :
export const importExcel = catchError(
   async(req , res , next)=>{
      const {path} = req.body ;
      if(!req.file) return next(new AppError("Please Choose Excel Sheet" , 404))

      if((req.file.size > uploadImageSize)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      const excelPath = req.file.path ;
      const collectionName = Collections[path] ;
      
      const data = await importExcelData(excelPath) ;
      await collectionName.insertMany(data) ;
      
      res.json({message:"success" , excelPath})
   }
) ;




//& Create Excel :
export const exportExcel = catchError(async (req, res, next) => {
   const {path} = req.query; 
   
   const collectionName = Collections[path] ;
   const data = await collectionName.find();
   const plainData = data.map(doc => doc.toObject()) ;
   
   const filePath = await exportDataToExcelWithinId(plainData) ;
   // if (filePath) {
   //    res.download(filePath , 'data.xlsx', (err) => {
   //       if (err) {
   //          console.error('❌ Error downloading file:', err);
   //          return next(new AppError('Error downloading file', 500));
   //       }
   //    });
   // } else {
   //    return next(new AppError('No data to export', 404)) ;
   // }


   res.json({message:"success" , filePath}) ;
});






// //& Add Excel :
// export const addExcelToDatabase = catchError(
//    async(req , res , next)=>{
//       if(!req.file) return next(new AppError("Please Choose Excel Sheet" , 404))

//       if((req.file.size > uploadImageSize)){
//          return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
//       }

//       const excelPath = req.file.path ;
      
//       const data = await importExcelData(excelPath) ;
//       await excelModel.insertMany(data) ;
//       console.log(data);
      
//       res.json({message:"success" , excelPath})

//    }
// ) ;





// //& Create Excel :
// export const generateExcel = catchError(async (req, res, next) => {
//    const data = await excelModel.find().select("-_id name age");
//    const plainData = data.map(doc => doc.toObject());

//    const filePath = await exportDataToExcelWithoutId(plainData);

//    if (filePath) {
//    res.download(filePath, 'data.xlsx', (err) => {
//       if (err) {
//          console.error('❌ Error downloading file:', err);
//          return next(AppError('Error downloading file', 500));
//       }
//    });
//    } else {
//    return next(AppError('No data to export', 404));
//    }
// });

