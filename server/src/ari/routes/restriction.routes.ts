// src/modules/restrictions/routes/restriction.routes.ts

import { Router } from 'express';
import { RestrictionController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';

export const restrictionRouter = Router();

// Apply restrictions (CTA/CTD)
restrictionRouter.route('/apply').post(
  protect,
  checkRoleBased('canUpdateRatePlan'), // or create 'canManageRestrictions'
  RestrictionController.applyRestrictions
);

// Get restrictions for a property
restrictionRouter.route('/:propertyCode').get(
  protect,
  RestrictionController.getRestrictions
);