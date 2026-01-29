import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { AgencyApplicationController } from "../controllers";

const agencyApplicationRouter = Router();
const agencyApplicationController = new AgencyApplicationController();

// Create agency application (no protection - public endpoint)
agencyApplicationRouter.route("/")
    .post(agencyApplicationController.createAgencyApplication.bind(agencyApplicationController));

// Update application status (approve/reject)
agencyApplicationRouter.route("/:applicationId/status")
    .put(protect, agencyApplicationController.updateApplicationStatus.bind(agencyApplicationController));

export { agencyApplicationRouter };
