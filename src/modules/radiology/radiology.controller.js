import slugify from "slugify";
import { radiologyModel } from "../../../DataBase/models/radiology.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { priceModel } from "../../../DataBase/models/price.model.js";
import { importExcelData } from "../../services/importExcel.js";
import { exportDataToExcelWithinId } from "../../services/exportExcel.js";


const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000 ;


//& Get All Radiology :
export const getAllRadiology = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      let result = await radiologyModel.find() ;

      //^ Merge Params
      let filterObj = {};

      //^ Filter By Order Type :
      if(filter == "active"){
         filterObj = { isActive:true }
      }else if (filter == "blocked"){
         filterObj = { isActive:false }
      }

      let apiFeature = new ApiFeature(radiologyModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const radiologies = await apiFeature.mongooseQuery.select("");

      if(!radiologies.length) return next(new AppError("Radiologies is Empty" , 404))

      let currentPag = apiFeature.pageNumber ;
      let numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      let limit = apiFeature.limit  ;
      let nextPage = numberOfPages - apiFeature.pageNumber ;
      let prevPage = (numberOfPages - nextPage) - 1 ;

      let metadata = {
         currentPag: currentPag ,
         numberOfPages: numberOfPages || 1 ,
         limit: limit ,
         }

         if(nextPage >  numberOfPages  && nextPage != 0){
            metadata.nextPage  = nextPage
         }
         if(currentPag <=  numberOfPages  && prevPage != 0 ){
            metadata.prevPage  = prevPage
         }
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  radiologies}) ;
   }
)





//& Get Radiology Count :
export const getRadiologyCount = catchError(
   async(req , res , next)=>{

      //! All Radiologies :
      const radiologies = await radiologyModel.find();


      //! Blocked Radiologies :
      const blockedRadiologies = await radiologyModel.find({isActive:false});
      
      
      //! Active Radiologies :
      const activeRadiologies = await radiologyModel.find({isActive:true});



      res.json({message:"success" , radiology_Data :{
         radiologies:{count:radiologies.length} ,
         active_radiology:{count:activeRadiologies.length } ,
         blocked_radiology:{count:blockedRadiologies.length } ,
      }}) ;
   }
)






//& Add radiology Only  :
export const addRadiology = catchError(
   async(req , res , next)=>{
      const {name , condition} = req.body ;

      const radiologyExist = await radiologyModel.findOne({ name }) ;
      if(radiologyExist) return next(new AppError("Radiology Already Exist", 404) ) ;


      //&Create slug By radiology Name : 
      const slug = slugify(name) ;

      const radiology = await radiologyModel.create({name , condition  , slug , createdBy:req.user._id}) ;

      !radiology && next(new AppError("Radiology Not Added", 404) ) ;
      radiology && res.json({message:"success" , radiology})
   }
)





//& Get Single radiology :
export const getSingleRadiology = catchError(
   async(req , res , next)=>{
      const radiology = await radiologyModel.findById(req.params?.id) ;

      !radiology && next(new AppError("Radiology Not Exist " , 404))
      radiology && res.json({message:"success" , radiology})
   }
)




// & Update radiology :
export const updateRadiology = catchError(
   async(req , res , next)=>{
      const {name , condition , isActive} = req.body ;
      const {id} = req.params ;

      const radiologyExist = await radiologyModel.findById(id) ;
      !radiologyExist && next(new AppError("Radiology Not Exist", 404) ) ;

     // 1- Check new radiology name not exist in database and not same name to this id :
      const duplicateRadiology = await radiologyModel.findOne({ name , _id: { $ne: id } });
      if (duplicateRadiology) return next(new AppError("Radiology name already exists", 400));

      // 2- if radiology name is changed , update radiology name in all prices :
      if (name !== radiologyExist.name) {
         await priceModel.updateMany(
            { testName: radiologyExist.name } ,
            { $set: { testName: name } }
         );
      }
      
      //&Create slug By radiology Name : 
      const slug = slugify(name) ;

      const radiology = await radiologyModel.findByIdAndUpdate(id , {name , condition , isActive , slug } , {new:true}) ;

      !radiology && next(new AppError("Radiology Not Added", 404) ) ;
      radiology && res.json({message:"success" , radiologyUpdate:radiology}) ;
   }
)




//& Delete radiology :
export const deleteRadiology = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const radiology = await radiologyModel.findByIdAndDelete(id , {new:true}) ;

      //! Delete All Price In PriceModel By radiology id :
      const deleteAllPriceRadiology = await priceModel.deleteMany({test:id})

      !radiology && next(new AppError("Not Found radiology" , 404))
      radiology && res.json({message:"success" , radiology , })
   }
)





//& Add All Radiologies By Excel Sheet :
export const addRadiologySheetExcelToDatabase = catchError(
   async(req , res , next)=>{
      if(!req.file) return next(new AppError("Please Choose Excel Sheet" , 404))

      if((req.file.size > uploadImageSize)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      const excelPath = req.file.path ;
      const data = await importExcelData(excelPath) ;
      for (const ele of data) {
         ele.createdBy = req.user._id ;
         ele.slug = slugify(ele.name) ;
      }
      const radiologies = await radiologyModel.insertMany(data) ;
      res.json({message:"Insert Radiologies Successfully 🥰"})
   }
) ;




//& Create Excel :
export const generateExcelListRadiology = catchError(async (req, res, next) => {
   const data = await radiologyModel.find();
   const plainData = data.map(doc => doc.toObject()) ;


   const filePath = await exportDataToExcelWithinId(plainData) ;
   if (filePath) {
      res.download(filePath, 'data.xlsx', (err) => {
         if (err) {
            console.error('❌ Error downloading file:', err);
            return next(AppError('Error downloading file', 500));
         }
      });
   } else {
      return next(AppError('No data to export', 404)) ;
   }
});