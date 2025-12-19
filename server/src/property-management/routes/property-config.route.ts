import { Router } from "express";
import { protect ,restrictTo} from "../../middlewares/auth.middleware";
import {PropertyConfigController} from "../controller";

const propertyConfigRoute=Router()
const propertyConfigController=new PropertyConfigController()
propertyConfigRoute.route("/:propertyId").patch(protect,restrictTo("super_admin"),propertyConfigController.updatePropertyConfig.bind(propertyConfigController))
propertyConfigRoute.route("/:propertyId").get(protect,propertyConfigController.getPropertyConfig.bind(propertyConfigController))
export{
    propertyConfigRoute
}