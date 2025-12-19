import { Router } from "express";
import  TaxGroupRoute  from "./tax-group.route";
import TaxRuleRoute  from "./tax-rule.route";
const taxSystemRouter = Router();
taxSystemRouter.use("/groups", TaxGroupRoute);
taxSystemRouter.use("/rules", TaxRuleRoute);
export default taxSystemRouter;