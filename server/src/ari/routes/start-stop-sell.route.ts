import { Router } from "express";
import { StartStopSellController } from "../controllers";
import {protect} from "../../middlewares/auth.middleware";
const router = Router();
const startStopSellController = new StartStopSellController();

router.route("/:propertyId").patch(protect,startStopSellController.createStartStopSell.bind(startStopSellController));
export default router;