// Payment Routes Index
import { Router } from 'express';
import { NGeniusRoutes } from './ngenius.routes';

const router = Router();

// Mount N-Genius routes
router.use('/ngenius', NGeniusRoutes);

export const PaymentRoutes = router;
