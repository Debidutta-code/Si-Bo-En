import { Router } from 'express';
import { activityController } from '../controller/log.controller';

const router = Router();




router.get('/', activityController.getAllActivities.bind(activityController));

export default router;