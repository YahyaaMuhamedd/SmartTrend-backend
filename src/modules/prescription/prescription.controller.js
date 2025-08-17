import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import { prescriptionModel } from "../../../DataBase/models/prescription.model.js";
import  path from "path";
import  fs from "fs";

const uploadImageSize = Number(process.env.UPLOAD_IMAGE_SIZE) || 2000000;



//& Get All Prescription :
export const getAllPrescription = catchError(
   async(req , res , next)=>{
      let result = await prescriptionModel.find();

      //^ Merge Params
      let filterObj = {};

      let apiFeature = new ApiFeature(prescriptionModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const prescription = await apiFeature.mongooseQuery.select("");

      if(!prescription.length) return next(new AppError("Prescription is Empty" , 404))

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
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  prescription}) ;
   }
)



//& Get Logged User Prescription :
export const getLoggedUserPrescription = catchError(
   async(req , res , next)=>{
      const{_id} = req.user ;


      let prescription = await prescriptionModel.find({createdBy:_id});
      if(!prescription.length > 0) return next(new AppError("Prescription is Empty!" , 404)) ;
      res.json({message:"success" ,  prescription }) ;
   }
)





//& Add New Prescription :
export const addPrescription = catchError(
   async(req , res , next)=>{
      const {phone , message} = req.body ;

      const createdBy = req.user._id
      let image = "" ;
      const existPrescription = await prescriptionModel.find({createdBy})
      //& Check On Size File Media Before Convert From k-byte to Mega byte :
      if(req.file){
         if((req.file.size > uploadImageSize)){
            return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
         }
         image = req.file.filename ;
      }

      if(existPrescription.length >= 5 ){

         //! Delete Old Prescription  :
         const id = existPrescription[0]._id;
         const  prescriptionDeleted = await prescriptionModel.findByIdAndDelete(id) ;

         //! Delete Image to Old Prescription And Update Image in Folder :
         const index = (process.env.BASE_URL.length + 13)
         const fileName = prescriptionDeleted.image.slice(index) 
         const fullPathFile = path.resolve(`Uploads/Prescription/${fileName}`)
         if(fs.existsSync(fullPathFile)){
            fs.unlinkSync(fullPathFile)
         }

         const prescription = await prescriptionModel.create({
            phone, 
            message , 
            image , 
            createdBy ,
            download_URL:`${process.env.BASE_URL}/api/v1/prescription/download/${image}`
         }) ;

         !prescription && next(new AppError("Prescription Not Added", 404) ) ;
         prescription &&  res.json({message:"success" , prescription}) ;
      }else{
         const prescription = await prescriptionModel.create({
            phone, 
            message , 
            image , 
            createdBy ,
            download_URL:`${process.env.BASE_URL}/api/v1/prescription/download/${image}`
         }) ;
   
         !prescription && next(new AppError("Prescription Not Added", 404) ) ;
         prescription &&  res.json({message:"success" , prescription}) ;
      }
   }
)




export const downloadPrescription = catchError(
   async (req, res, next) => {
      const { imageName } = req.params;
      const filePath = path.resolve(`Uploads/Prescription/${imageName}`);

      if (!fs.existsSync(filePath)) {
         return next(new AppError("Image not found", 404));
      }

      const imageExt = path.extname(imageName); //  .png أو .jpg أو .webp
      const fileName = `prescription-${Date.now()}${imageExt}`;
      res.download(filePath, fileName);
   }
);







//& Seen prescription :
export const seenPrescription = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const prescription = await prescriptionModel.findByIdAndUpdate(id , {is_seen:true} ,{new:true}) ;
      const prescriptions = await prescriptionModel.find() ;

      !prescription && next(new AppError("Not Found Prescription" , 404))
      prescription && res.json({message:"success" , prescriptions})
   }
)



//& Delete prescription By id :
export const deletePrescription = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      
      const prescription = await prescriptionModel.findByIdAndDelete(id , {new:true}) ;
      const prescriptions = await prescriptionModel.find() ;

      !prescription && next(new AppError("Prescription Not Exist " , 404))
      prescription && res.json({message:"success" , prescriptions })
   }
)

