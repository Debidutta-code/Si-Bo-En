import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { AgenticPropertyController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const agenticPropertyRouter = Router();
const agenticPropertyController = new AgenticPropertyController();

// Create agentic property
agenticPropertyRouter.route('/').post(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    agenticPropertyController.createAgenticProperty.bind(
        agenticPropertyController
    )
);

// Get agentic property details
agenticPropertyRouter
    .route('/:id')
    .get(
        protect,
        agenticPropertyController.getAgenticPropertyDetails.bind(
            agenticPropertyController
        )
    )
    .delete(
        protect,
        agenticPropertyController.deleteAgenticProperty.bind(
            agenticPropertyController
        )
    );

// Get available properties for agent
agenticPropertyRouter
    .route('/available/:agencyId')
    .get(
        protect,
        agenticPropertyController.createAvailablePropertiesForAgents.bind(
            agenticPropertyController
        )
    );

// Get agencies by property
agenticPropertyRouter
    .route('/property/:propertyId')
    .get(
        protect,
        agenticPropertyController.getAgenciesByPropertyId.bind(
            agenticPropertyController
        )
    );

// Get reservations by agents
agenticPropertyRouter.route('/reservations/:agencyId/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    agenticPropertyController.getReservationsByAgents.bind(
        agenticPropertyController
    )
);

export { agenticPropertyRouter };
