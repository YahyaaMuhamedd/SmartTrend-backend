import { branchModel } from "../../DataBase/models/branch.model.js";
import { companyModel } from "../../DataBase/models/company.model.js";
import { orderModel } from "../../DataBase/models/order.model.js";
import { priceModel } from "../../DataBase/models/price.model.js";
import { testModel } from "../../DataBase/models/test.model.js";
import { userModel } from "../../DataBase/models/user.model.js";


export const Collections =
   {
      USER: userModel ,
      TEST: testModel ,
      PRICE: priceModel ,
      ORDER: orderModel ,
      COMPANY: companyModel ,
      BRANCH: branchModel ,
   }