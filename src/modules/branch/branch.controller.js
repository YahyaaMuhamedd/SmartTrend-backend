import { branchModel } from "../../../DataBase/models/branch.model.js";
import { companyModel } from "../../../DataBase/models/company.model.js";
import { AppError } from "../../utilities/AppError.js";
import { ApiFeature } from "../../utilities/apiFeatures.js";
import { catchError } from "../../utilities/catchError.js";




//& Get All Branches :
export const getAllBranches = catchError(
   async(req , res , next)=>{
      const{filter} = req.query ;
      let result = await branchModel.find();


      //^ Filter By Order Type :
      let filterObj = {};
      if(filter === "active"){
         filterObj = { isActive:true }
      }else if (filter === "block"){
         filterObj = { isActive:false }
      }
      
      let apiFeature = new ApiFeature(branchModel.find(filterObj), req.query ).pagination().fields().search().filter().sort();
      const branches = await apiFeature.mongooseQuery.select("-password");

      if(!branches.length) return next(new AppError("Branches is Empty" , 404))

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
      res.json({message:"success" , results:result.length ,  metadata: metadata ,  branches}) ;
   }
)



//& Get Branch Count :
export const getBranchCount = catchError(
   async(req , res , next)=>{

      //! All Branch :
      const branch = await branchModel.find();

      //! Get All Branch Specific Company :
      let arr = [];
      const companies = await companyModel.find();
      for (const company of companies) {
         const branch = await branchModel.find({company:company._id}) ;
         arr.push({company , branch_count:branch.length})
      }


      //! Blocked Branch :
      const blockedBranch = await branchModel.find({isActive:false});
      
      
      //! Cancel Branch :
      const activeBranch = await branchModel.find({isActive:true});


      res.json({message:"success" , branch_Data :{
         count:branch.length ,
         branchSpecificCompany:arr ,
         active_Branch:activeBranch.length  ,
         blocked_Branch:blockedBranch.length ,
      }}) ;
   }
)



//& Add New Branch :
export const addBranch = catchError(
   async(req , res , next)=>{
      const {name , email  , phone , password , street , city , area , company } = req.body ;
      const branchExist = await branchModel.findOne({email}) ;
      if(branchExist) return next(new AppError("Branch Already Exist" , 402)) ;

      const companyExist = await companyModel.findById(company) ;
      if(!companyExist) return next(new AppError("Company Not Exist" , 404)) ;


      const createdBy = req.user._id

      const branch = await branchModel.create({
         name , 
         email , 
         phone, 
         password ,
         address:{
            street , 
            city , 
            area
         } ,
         company , 
         createdBy
      }) ;

      !branch && next(new AppError("The branch has not been added.", 404) ) ;
      branch &&  res.json({message:"success" , branch}) ;
   }
)


//& Get Single Branch :
export const getSingleBranch = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;

      const branch = await branchModel.findById(id) ;

      !branch && next(new AppError("Branch Not Exist" , 404))
      branch && res.json({message:"success" , branch})
   }
)


//& Update Branch :
export const updateBranch = catchError(
   async(req , res , next)=>{

      const{id} = req.params ;
      const {name , email  , phone , password , street , city , area , company , isActive} = req.body ;

      //& Check Exist Branch By BranchId :
      const branch = await branchModel.findById(id);
      if (!branch) return next(new AppError("Branch Not Exist" , 404)) ;


      //& Check Exist Company By CompanyId :
      if(company){
         const companyExist = await companyModel.findById(company) ;
         if(!companyExist) return next(new AppError("Company Not Exist" , 404)) ;
         branch.company = company ;
      }

      //& Check Branch Email Same Email Entered :
      if (email && email !== branch.email) {
         const existing = await branchModel.findOne({ email });

      //& Check Branch Email Exist in Database :
         if (existing && existing._id.toString() !== id) {
            return next(new AppError('Email is already in use by another user' , 404)) ;
         }
         branch.email = email
      }
      if(name){
         branch.name = name
      }
      if(phone){
         branch.phone = phone
      }
      if(isActive){
         branch.isActive = isActive
      }
      if(street){
         branch.address.street = street
      }
      if(city){
         branch.address.city = city
      }
      if(area){
         branch.address.area = area
      }
      if(password){
         branch.password = password
      }

      await branch.save() ;

      !branch && next(new AppError("The branch has not been Updated.", 404) ) ;
      branch &&  res.json({message:"success" , branch}) ;
   }
)




//& Delete Branch :
export const deleteBranch = catchError(
   async(req , res , next)=>{
      const {id} = req.params ;
      const branch = await branchModel.findByIdAndDelete(id) ;
      if(!branch) return next(new AppError("Branch Not Exist" , 404))
      branch && res.json({message:"success" , branch })
   }
)