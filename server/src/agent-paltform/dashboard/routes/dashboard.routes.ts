import { Router } from "express";
import { partnerProtected } from "../../middleware";
import { AgentDashboardController } from "../controllers";

const agentDashboardRouter = Router();
const dashboardController = new AgentDashboardController();

agentDashboardRouter.route("/analytics")
    .get(partnerProtected, dashboardController.getAnalytics.bind(dashboardController));

agentDashboardRouter.route("/properties")
    .get(partnerProtected, dashboardController.getProperties.bind(dashboardController));

export { agentDashboardRouter };
