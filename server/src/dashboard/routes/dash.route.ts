import { protect } from "../../middlewares/auth.middleware";
import { Router } from "express";

import { DashBoardController } from "../controllers";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

const dashBoardController = new DashBoardController();

const dashboardRouter = Router();

dashboardRouter.route("/get-analytics").get(protect,dashBoardController.getAnalytics.bind(dashBoardController))
dashboardRouter.route("/properties").get(protect, dashBoardController.getPropertyNames.bind(dashBoardController))
dashboardRouter.route("/properties-by-creation-id").get(protect, dashBoardController.getPropertyByCreationId.bind(dashBoardController))
dashboardRouter.route("/statistics-comparison").get(protect, dashBoardController.getStatisticsComparison.bind(dashBoardController));

export {
    dashboardRouter
}