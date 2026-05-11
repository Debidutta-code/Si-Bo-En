import { Router } from 'express';
import { partnerProtected } from '../../middleware';
import { AgentAuthController } from '../controllers';

const agentAuth = Router();
const agentAuthController = new AgentAuthController();

agentAuth
    .route('/login')
    .post(agentAuthController.login.bind(agentAuthController));
agentAuth
    .route('/me')
    .get(partnerProtected, agentAuthController.getMe.bind(agentAuthController));
agentAuth
    .route('/logout')
    .post(
        partnerProtected,
        agentAuthController.logout.bind(agentAuthController)
    );

export { agentAuth };
