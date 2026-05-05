
import { Router } from 'express';
import { GroupSearchController } from '../controllers';

const groupSearchRouter = Router();
const controller = new GroupSearchController();
groupSearchRouter
  .route('/brand/:brandId')
  .post(controller.getPropertiesByBrand.bind(controller));

groupSearchRouter
  .route('/:groupId/brands')
  .get(controller.getBrandsByGroup.bind(controller));

groupSearchRouter
  .route('/:groupId')
  .post(controller.getPropertiesByGroup.bind(controller));

export { groupSearchRouter };
