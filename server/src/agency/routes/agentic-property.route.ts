import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { AgenticPropertyController } from "../controllers";

const agenticPropertyRouter = Router();
const agenticPropertyController = new AgenticPropertyController();

// Create agentic property
agenticPropertyRouter.route("/")
    .post(protect, agenticPropertyController.createAgenticProperty.bind(agenticPropertyController));

// Get agentic property details
agenticPropertyRouter.route("/:id")
    .get(protect, agenticPropertyController.getAgenticPropertyDetails.bind(agenticPropertyController))
    .delete(protect, agenticPropertyController.deleteAgenticProperty.bind(agenticPropertyController));

// Get available properties for agent
agenticPropertyRouter.route("/available/:agencyId")
    .get(protect, agenticPropertyController.createAvailablePropertiesForAgents.bind(agenticPropertyController));

// Get reservations by agents
agenticPropertyRouter.route("/reservations/:agencyId/:propertyId")
    .get(protect, agenticPropertyController.getReservationsByAgents.bind(agenticPropertyController));

export { agenticPropertyRouter };
