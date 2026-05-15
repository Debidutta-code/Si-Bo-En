import { attachPropertyDetails } from "../../middlewares/property.middleware";
import { Router } from "express";
import { ActiveLanguageController } from "../controller/active-language.controller";
import { protect } from "../../middlewares/auth.middleware";

const propertyLanguageRouter = Router();
const activeLanguageController = new ActiveLanguageController();

propertyLanguageRouter.route("/delete/:id")
    .delete(protect,activeLanguageController.deleteActiveLanguage.bind(activeLanguageController));
propertyLanguageRouter.route("/:propertyId")
.get(protect, activeLanguageController.getAllActiveLanguages.bind(activeLanguageController))
    .post(protect, attachPropertyDetails({
        identifierType:"id",
        key:"propertyId",
        source:"params",
    }), activeLanguageController.createActiveLanguage.bind(activeLanguageController));


    export { propertyLanguageRouter };