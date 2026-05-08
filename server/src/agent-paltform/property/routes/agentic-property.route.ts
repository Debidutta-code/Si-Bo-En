import { Router } from 'express';
import { partnerProtected } from '../../middleware';
import { AgenticPropertyController } from '../controllers';

const agenticPartnerRouter = Router();
const agenticPropertyController = new AgenticPropertyController();

agenticPartnerRouter
    .route('/')
    .get(
        partnerProtected,
        agenticPropertyController.getProperties.bind(agenticPropertyController)
    );

// agenticPartnerRouter.route("/:agenticPropertyId").get( partnerProtected, agenticPropertyController.getByAgenticPropertyId.bind(agenticPropertyController));
export { agenticPartnerRouter };
