import { companyModel } from "../../../DataBase/models/company.model.js";
import { priceModel } from "../../../DataBase/models/price.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";
import fs from "fs" ;
import path from "path" ;




//& Get All Companies :
export const getAllCompanies = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;

      let result = await companyModel.find();

      //^ Merge Params
      let filterObj = {};

      //^ Filter By Order Type :
      if(filter == "active"){
         filterObj = { isActive:true }
      }else if (filter == "blocked"){
         filterObj = { isActive:false }
      }

      let apiFeature = new ApiFeature(companyModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const companies = await apiFeature.mongooseQuery;
      // const companies = await apiFeature.mongooseQuery.select("name phone address isActive logo description discount start addresses");

      if(!companies.length) return next(new AppError("companies is Empty" , 404))

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
      
      
      //! Cancel Orders :
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
      const {name , email , password , phone, description , address} = req.body ;
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
         password ,
         phone, 
         description , 
         address ,
         logo , 
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
      const {name , email ,  address , phone , description , discount  , isActive} = req.body ;
      if(email){
         const existCompany = await companyModel.findOne({email}) ;
         if(existCompany) return next(new AppError("Company Email Already Exist")) ;
      }


      const company = await companyModel.findByIdAndUpdate(req.params.id , {name , address , phone  , email , description , discount , isActive} , {new:true}) ;

      !company && next(new AppError("Company Not Found", 404) ) ;
      company &&  res.json({message:"success" , company}) ;
   }
)


//& change ImgCover :
export const changeImgCover = catchError(
   async(req , res , next)=>{
      if(!req.file) return next(new AppError("Please Choose image Cover Your Company" , 404))

      if((req.file.size > +process.env.UPLOAD_IMAGE_SIZE)){
         return next(new AppError("Size Media Should be Less than 200 k-Byte" , 404))
      }

      const logo = req.file.filename ;

      const company = await companyModel.findByIdAndUpdate(req.params.id , {logo}) ;
      if(!company) return  next(new AppError("Company Not Found", 404) ) ;
      
      //! Delete Image from Server Disk :
      const fileName = "Uploads/company/" + path.basename(company.logo)
      fs.unlinkSync(path.resolve(fileName))

      const newCompany = await companyModel.findById(req.params.id) ;

      !newCompany && next(new AppError("Company Not Found After Change Cover", 404) ) ;
      newCompany &&  res.json({message:"success" , newCompany}) ;
   }

)


//& Delete company :
export const deleteCompany = catchError(
   async(req , res , next)=>{
      const company = await companyModel.findByIdAndDelete(req.params?.id , {new:true}) ;
      if(!company) return next(new AppError("Not Found company" , 404))

      //! Delete Image from Server Disk :
      const fileName = "Uploads/company/" + path.basename(company.logo)
      fs.unlinkSync(path.resolve(fileName))

      //! Delete All Price In PriceModel By Company id :
      const deleteAllPriceTest = await priceModel.deleteMany({company:req.params?.id})

      company && res.json({message:"success" , company })
   }
)