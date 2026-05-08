import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { AgentController } from '../controllers';

const agentRouter = Router();
const agentController = new AgentController();

// Agent login (no protection needed)
agentRouter
    .route('/login')
    .post(agentController.loginAgent.bind(agentController));

// Create agent and get agents by agency
agentRouter
    .route('/')
    .post(protect, agentController.createAgent.bind(agentController));

// Get agents by agency ID
agentRouter
    .route('/agency/:agencyId')
    .get(protect, agentController.getAgents.bind(agentController));

// Get agent by email
agentRouter
    .route('/email/:email')
    .get(protect, agentController.getAgentByEmail.bind(agentController));

// Agent operations by ID
agentRouter
    .route('/:id')
    .put(protect, agentController.updateAgent.bind(agentController))
    .delete(protect, agentController.deleteAgent.bind(agentController));

export { agentRouter };
