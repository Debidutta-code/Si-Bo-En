import { Router } from "express";
import { protect,restrictTo } from "../../middlewares/auth.middleware";
import {
    PropertyIntegrationController,
    PropertyFieldIntegrationController,
} from "../controller/property-integration.controller";

const propertyPartnerRouter = Router();
const propertyIntegrationController = new PropertyIntegrationController();
const propertyFieldIntegrationController = new PropertyFieldIntegrationController();

propertyPartnerRouter.route("/property/:propertyId")
    .get(
        protect,
        restrictTo("super_admin"),
        propertyIntegrationController.getAllPropertyIntegrations.bind(propertyIntegrationController)
    );

propertyPartnerRouter.route("/field/:id")
    .post(
        protect,
        restrictTo("super_admin"),
        propertyFieldIntegrationController.addFields.bind(propertyFieldIntegrationController)
    )
    .patch(
        protect,
        restrictTo("super_admin"),
        propertyFieldIntegrationController.updateFields.bind(propertyFieldIntegrationController)
    )
    .delete(
        protect,
        restrictTo("super_admin"),
        propertyFieldIntegrationController.deleteFields.bind(propertyFieldIntegrationController)
    )

propertyPartnerRouter.route("/").post(
    protect,
    restrictTo("super_admin"),
    propertyIntegrationController.createPropertyIntegration.bind(propertyIntegrationController)
);
propertyPartnerRouter.route("/:id").patch(
    protect,
    restrictTo("super_admin"),
    propertyIntegrationController.updatePropertyIntegrationStatus.bind(propertyIntegrationController)
).delete(
    protect,
    restrictTo("super_admin"),
    propertyIntegrationController.deletePropertyIntegration.bind(propertyIntegrationController)
);

export  {propertyPartnerRouter};