// routes/activity.routes.ts

import { Router } from 'express';
import ActivityController from '../controller/activity.controller';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import {checkRoleBased} from "../../middlewares/checkRole.middleware"

const router = Router();

router.get('/stats', protect,checkRoleBased("canViewLogs"), ActivityController.getActivityStats);

router.get('/recent', protect,checkRoleBased("canViewLogs"), ActivityController.getRecentActivities);

router.get('/search', protect,checkRoleBased("canViewLogs"), ActivityController.searchActivities);

router.get('/user/:userId', protect,checkRoleBased("canViewLogs"), ActivityController.getUserActivityHistory);

router.get('/property/:propertyCode', protect,checkRoleBased("canViewLogs"), ActivityController.getActivitiesByProperty);

router.get(
  '/booking/status/:status',
  protect,
  checkRoleBased("canViewLogs"),
  ActivityController.getBookingActivitiesByStatus
);

router.get('/:id', protect,checkRoleBased("canViewLogs"), ActivityController.getActivityById);

router.get('/', protect,checkRoleBased("canViewLogs"), ActivityController.getActivities);

router.delete(
  '/:id',
  protect,
  restrictTo('super_admin'),
  ActivityController.deleteActivity
);

export default router;