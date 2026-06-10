import {Router} from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {PropertyTransferController} from "../controller";
const transferRoute = Router();
const propertyTransferController = new PropertyTransferController();
transferRoute.route("/init").post(
    protect,
    propertyTransferController.initTransferProcessController.bind(propertyTransferController)
);

transferRoute.route("/complete").post(
    protect,
    propertyTransferController.completeTransferProcessController.bind(propertyTransferController)
);

export {transferRoute};