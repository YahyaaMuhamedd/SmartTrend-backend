import { branchModel } from "../../../DataBase/models/branch.model.js" ;
import { companyModel } from "../../../DataBase/models/company.model.js" ;
import { priceModel } from "../../../DataBase/models/price.model.js" ;
import { AppError } from "../../utilities/AppError.js" ;
import { ApiFeature } from "../../utilities/apiFeatures.js" ;
import { catchError } from "../../utilities/catchError.js" ;
import fs from "fs" ;
import path from "path" ;




//& Get All Companies :
export const getAllCompanies = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      const result = await companyModel.find();

      //^ Merge Params
      let filterObj = {};

      //^ Filter By Order Type :
      switch (filter) {
      case "active":
         filterObj = { isActive: true };
         break;
      case "blocked":
         filterObj = { isActive: false };
         break;
      case "analysis":
      case "radiology":
      case "pharmacy":
      case "hospital":
         filterObj = { service: filter };
         break;
      default:
         filterObj = {} ; 
      }


      const apiFeature = new ApiFeature(companyModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const companies = await apiFeature.mongooseQuery;

      if(!companies.length) return next(new AppError("companies is Empty" , 404))

      const currentPag = apiFeature.pageNumber ;
      const numberOfPages = Math.ceil(result.length  / apiFeature.limit)  ;
      const limit = apiFeature.limit  ;
      const nextPage = numberOfPages - apiFeature.pageNumber ;
      const prevPage = (numberOfPages - nextPage) - 1 ;

      const metadata = {
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
      // res.json({message:"success" , results:companies.length ,  metadata: metadata ,  companies }) ;
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  companies}) ;
   }
)


//& Get Order Count :
export const getCompanyCount = catchError(
   async(req , res , next)=>{

      //! All Company :
      const company = await companyModel.find();


      //! Blocked Company :
      const blockedCompany = await companyModel.find({isActive:false});
      
      
      //! Cancel Company :
      const activeCompany = await companyModel.find({isActive:true});



      res.json({message:"success" , Company_Data :{
         companies:{count:company.length , company} ,
         active_company:{count:activeCompany.length } ,
         blocked_company:{count:blockedCompany.length } ,
      }}) ;
   }
)


//& Add New Company :
export const addCompany = catchError(
   async(req , res , next)=>{
      const {name , email , phone, description , address , service} = req.body ;
      const companyExist = await companyModel.findOne({email}) ;
      if(companyExist) return next(new AppError("Company is Already Exist" , 402)) ;

      //& Check On Size File Media Before Convert From k-byte to Mega byte :
      let logo = "" ;
      if(req.file){
         console.log(req.file);
         // req.file.size = req.file.size / 1024 ;
         if((req.file.size > +process.env.UPLOAD_IMAGE_SIZE)){
            return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
         }
         logo = req.file.filename ;
      }

      const createdBy = req.user._id
      const start = Date.now() ;
      const company = await companyModel.create({
         name , 
         email , 
         phone, 
         description , 
         address ,
         logo , 
         service ,
         start ,
         createdBy
      }) ;

      !company && next(new AppError("company Not Added", 404) ) ;
      company &&  res.json({message:"success" , company}) ;
   }
)


//& Get Single company :
export const getSingleCompany = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const company = await companyModel.findById(id) ;
      const testCount = await priceModel.find({company:id}) ;

      !company && next(new AppError("Not Found company" , 404))
      company && res.json({message:"success" , test_Count:testCount.length ,  company})
   }
)


//& Update Company :
export const updateCompany = catchError(
   async(req , res , next)=>{
      const {name , email ,  address , phone , description  , isActive , service} = req.body ;
      const {id} = req.params ;

      const existCompany = await companyModel.findById(id) ;
      if(!existCompany) return next(new AppError("Company Not Exist")) ;

      // 1- Check new company email not exist in database and not same email to this id :
      const duplicateCompany = await companyModel.findOne({ email , _id: { $ne: id } });
      if (duplicateCompany) return next(new AppError("Company Email Already Exists", 400));


      const company = await companyModel.findByIdAndUpdate(req.params.id , {name  , service , address , phone  , email , description  , isActive} , {new:true}) ;

      !company && next(new AppError("Company Not Found", 404) ) ;
      company &&  res.json({message:"success" , company}) ;
   }
)


//& change ImgCover :
export const changeImgCover = catchError(
   async(req , res , next)=>{
      const {id} = req.params;
      if(!req.file) return next(new AppError("Please Choose image Cover Your Company" , 404))


      //! Check Image Size Before Uploaded :
      if((req.file.size > +process.env.UPLOAD_IMAGE_SIZE)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      
      //! Update Old Image To New Image :
      const logo = req.file.filename ;
      const company = await companyModel.findByIdAndUpdate(id , {logo}) ;
      if(!company) return  next(new AppError("Company Not Found", 404) ) ;

      //! Check Old File Name if Exist Delete This Old File and Delete Old Image from Server Disk :
      const fileName = "Uploads/company/" + path.basename(company.logo)
      const destPath = path.resolve(fileName)
      if(fs.existsSync(destPath)){
         fs.unlinkSync(path.resolve(fileName))
      }

      //! Get New Company After Updated :
      const newCompany = await companyModel.findById(id) ;
      !newCompany && next(new AppError("Company Not Found After Change Cover", 404) ) ;
      newCompany &&  res.json({message:"success" , newCompany}) ;
   }

)


//& Delete company :
export const deleteCompany = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const company = await companyModel.findByIdAndDelete(id) ;
      if(!company) return next(new AppError("Company Not Exist" , 404))

      //! Delete Image from Server Disk :
      const fileName = "Uploads/company/" + path.basename(company.logo)
      const destPath = path.resolve(fileName)
      if(fs.existsSync(destPath)){
         fs.unlinkSync(path.resolve(fileName))
      }

      //! Delete All Price And All Branch This Company By Company id :
         await priceModel.deleteMany({company:id})
         await branchModel.deleteMany({company:id})

      company && res.json({message:"success" , company })
   }
)