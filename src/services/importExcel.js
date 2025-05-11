
import xlsx from "xlsx" ;



export const importExcelData = async (filePath) => {
   try {
      const workbook = xlsx.readFile(filePath) ;
      const sheetName = workbook.SheetNames[0] ;
      const worksheet = workbook.Sheets[sheetName] ;
      const data = xlsx.utils.sheet_to_json(worksheet) ;

      console.log('📥 Excel data imported successfully.') ;
      return data ;
   } catch (error) {
      console.error('⚠️ Error importing Excel data:', error) ;
   }
};



