import { Router } from "express";
import  TaxGroupRoute  from "./tax-group.route";
import TaxRuleRoute  from "./tax-rule.route";
import TouristTaxRoute from "./tourist-tax.route";
const taxSystemRouter = Router();
taxSystemRouter.use("/groups", TaxGroupRoute);
taxSystemRouter.use("/rules", TaxRuleRoute);
taxSystemRouter.use("/tourist-taxes", TouristTaxRoute);
export default taxSystemRouter;