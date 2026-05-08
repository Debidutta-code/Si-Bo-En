import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { AgencyController } from '../controllers';

const agencyRouter = Router();
const agencyController = new AgencyController();

// Get all agencies (paginated)
agencyRouter
    .route('/')
    .get(protect, agencyController.getAgencies.bind(agencyController))
    .post(protect, agencyController.createAgency.bind(agencyController));

// Agency operations by ID
agencyRouter
    .route('/:agencyId')
    .get(protect, agencyController.getAgencyById.bind(agencyController))
    .put(protect, agencyController.updateAgency.bind(agencyController))
    .delete(protect, agencyController.deleteAgency.bind(agencyController));

// Get reservations for agency
agencyRouter
    .route('/:agencyId/reservations')
    .get(
        protect,
        agencyController.getReservationsForAgency.bind(agencyController)
    );

export { agencyRouter };
