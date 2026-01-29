import { protect } from "../../middlewares/auth.middleware";
import { Router } from "express";

import { DashBoardController } from "../controllers";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

const dashBoardController = new DashBoardController();

const dashboardRouter = Router();

dashboardRouter.route("/get-analytics").get(protect, attachPropertyDetails({
    identifierType: "id",
    key: "propertyId",
    source: "query"
}), dashBoardController.getAnalytics.bind(dashBoardController))
dashboardRouter.route("/properties").get(protect, dashBoardController.getPropertyNames.bind(dashBoardController))
dashboardRouter.route("/statistics-comparison").get(protect, attachPropertyDetails({
    identifierType: "id",
    key: "propertyId",
    source: "query"
}),dashBoardController.getStatisticsComparison.bind(dashBoardController));

export {
    dashboardRouter
}