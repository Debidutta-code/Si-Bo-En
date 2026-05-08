import { Router } from 'express';
import { ProblemTicketController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';

const problemTicketRouter = Router();
const controller = new ProblemTicketController();

// Customer routes
problemTicketRouter
    .route('/')
    .post(controller.createTicket.bind(controller))
    .get(controller.getTicketsForCustomer.bind(controller));
problemTicketRouter
    .route('/:id')
    .patch(controller.updateTicket.bind(controller))
    .delete(controller.deleteTicket.bind(controller));

// Property routes
problemTicketRouter.get(
    '/property/:propertyId',
    protect,
    controller.getTicketsForProperty.bind(controller)
);
problemTicketRouter.patch(
    '/status/:id',
    protect,
    controller.updateTicketStatus.bind(controller)
);
problemTicketRouter.patch(
    '/priority/:id',
    protect,
    controller.updateTicketPriority.bind(controller)
);

export { problemTicketRouter };
