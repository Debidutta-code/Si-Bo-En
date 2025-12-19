import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { TaxRuleController } from "../controllers/tax-rule.controller";

const taxRuleRouter = Router();
const taxRuleController = new TaxRuleController();

taxRuleRouter.route("/").post(protect, taxRuleController.createTaxRuleController.bind(taxRuleController));
taxRuleRouter.route("/property/:propertyId").get(
    taxRuleController.getTaxRulesByPropertyIdController.bind(taxRuleController)
);
taxRuleRouter.route("/:taxRuleId").put(
    taxRuleController.updateTaxRuleController.bind(taxRuleController)
).delete(
    taxRuleController.deleteTaxRuleController.bind(taxRuleController)
);

export default taxRuleRouter;