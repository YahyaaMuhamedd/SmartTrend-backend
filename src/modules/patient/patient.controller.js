import { patientModel } from "../../../DataBase/models/patient.model.js";
import cloudinary from "../../services/cloudinary.config.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";






//& Get All Patient :
export const getAllPatient = catchError(
   async(req , res , next)=>{
      let result = await patientModel.find();

      //^ Merge Params
      let filterObj = {};

      let apiFeature = new ApiFeature(patientModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const patients = await apiFeature.mongooseQuery;

      if(!patients.length) return next(new AppError("Patients is Empty" , 404))

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
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  patients}) ;
   }
)





//& Added New Patient :
export const add_Patient = catchError(
   async(req , res , next)=>{
      const {birthDay , patient_Phone , patient_Name  , gender } = req.body ;

      const patientExist = await patientModel.findOne({patient_Name:patient_Name}) ;
      patientExist && next(new AppError("Patient Name Already Exist" , 404))


         //& Calculation Age From BirthDay :
         let age = 0 ;
         let nowAge = (birthDay)=>{
            let dateNow = new Date()
            let birth = new Date(birthDay)
            let diff = dateNow - birth
            let age = Math.floor(diff/1000/60/60/24/365);
            return age
         }
         age = nowAge(birthDay)


         const patient = await patientModel.create({
            patient_Name , 
            patient_Age:age , 
            birthDay , 
            gender ,
            patient_Phone , 
         })
         
         !patient && next(new AppError("Patient Not Added" , 404))
         patient && res.json({message:"Successfully Added Patient" , patient})
   }
)





//& Get Single patient :
export const getSinglePatient = catchError(
   async(req , res , next)=>{
      const patient = await patientModel.findById(req.params?.id) ;
      !patient && next(new AppError("patient Not Exist" , 404))
      patient && res.json({message:"success" , patient})
   }
)




//& Update User :
export const updatePatient = catchError(
   async(req , res , next)=>{
      const {birthDay , patient_Phone , patient_Name  , gender } = req.body ;
      const {id} = req.params ;

      let patient = await patientModel.findById(id) ;
      if(!patient){
         return next(new AppError("Patient Not Exist" , 404)) ;
      }



      //& Check On Patient Name Not Repeat the Name :
      const patientExist = await patientModel.findOne({patient_Name:patient_Name}) ;
      if(patientExist){
         return next(new AppError("Patient Name Already Exist" , 404)) ;
      } 


      //& Calculation Age From BirthDay :
      let age = 0 ;
      let nowAge = (birthDay)=>{
         let dateNow = new Date()
         let birth = new Date(birthDay)
         let diff = dateNow - birth
         let age = Math.floor(diff/1000/60/60/24/365);
         return age
      }
      age = nowAge(birthDay)



      patient.patient_Name =  patient_Name ;
      patient.patient_Age = age ; 
      patient.birthDay = birthDay ;
      patient.gender = gender ; 
      patient.patient_Phone = patient_Phone ; 
      await patient.save() ;

      res.json({message:"Successfully Updated Patient" , patient})
   }
)




//& Delete User :
export const deletePatient = catchError(
   async(req , res , next)=>{
      const patient = await patientModel.findByIdAndDelete(req.params.id , {new:true}) ;

      !patient && next(new AppError("Not Found Patient" , 404))
      patient && res.json({message:"success" , patient})
   }
)