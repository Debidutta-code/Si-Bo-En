import { protect } from '../../middlewares/auth.middleware';
import { Router } from 'express';
import { ChildAddonsController } from '../controllers';

const childAddonRoute = Router();
const childAddonController = new ChildAddonsController();

childAddonRoute
    .route('/')
    .post(childAddonController.createChildAddons.bind(childAddonController))
    .get(childAddonController.getChildAddons.bind(childAddonController));

childAddonRoute
    .route('/:childAddonId')
    .put(childAddonController.updateChildAddons.bind(childAddonController))
    .delete(childAddonController.deleteChildAddon.bind(childAddonController));

export { childAddonRoute };
