import { Router } from 'express';
import {
    agencyRouter,
    agentRouter,
    agenticPropertyRouter,
    agenticRoomRouter,
    agencyApplicationRouter,
} from './index';

const agencyMainRouter = Router();

// Mount all agency-related routes
agencyMainRouter.use('/agencies', agencyRouter);
agencyMainRouter.use('/agents', agentRouter);
agencyMainRouter.use('/agentic-properties', agenticPropertyRouter);
agencyMainRouter.use('/agentic-rooms', agenticRoomRouter);
agencyMainRouter.use('/agency-applications', agencyApplicationRouter);

export { agencyMainRouter };
