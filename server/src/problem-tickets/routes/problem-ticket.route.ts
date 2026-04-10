import { Router } from "express";
import { ProblemTicketController } from "../controllers";
import { customerProtect, protect } from "../../../../common/middlewares";

const problemTicketRouter = Router();
const controller = new ProblemTicketController();

// Customer routes
problemTicketRouter.route("/")
    .post(customerProtect, controller.createTicket.bind(controller))
    .get(customerProtect, controller.getTicketsForCustomer.bind(controller));
problemTicketRouter.route("/:id")
    .patch(customerProtect, controller.updateTicket.bind(controller))
    .delete(customerProtect, controller.deleteTicket.bind(controller));

// Property routes
problemTicketRouter.get("/property/:propertyId", protect, controller.getTicketsForProperty.bind(controller));
problemTicketRouter.patch("/status/:id", protect, controller.updateTicketStatus.bind(controller));
problemTicketRouter.patch("/priority/:id", protect, controller.updateTicketPriority.bind(controller));

export { problemTicketRouter };