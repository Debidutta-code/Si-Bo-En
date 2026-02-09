import { Router } from 'express';
import { AgentPricingController } from '../controllers';
import { partnerProtected } from '../../middleware';

const agentPricingRouter = Router();
const pricingController = new AgentPricingController();

agentPricingRouter.route('/get-pricing').post(
    partnerProtected,
    pricingController.getAgentPricing.bind(pricingController)
);

export { agentPricingRouter };