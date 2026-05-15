import { Router } from 'express';
import { MasterPropertyCategoryTranslationController, MasterPropertyTypeTranslationController, MasterAmenityTranslationController, MasterRoomViewTranslationController } from '../../controllers/property/property-masters.controller';

const masterPropertyCategoryTranslationRouter = Router();
const masterPropertyCategoryTranslationController = new MasterPropertyCategoryTranslationController();

masterPropertyCategoryTranslationRouter.route('/:masterPropertyCategoryId')
  .put(masterPropertyCategoryTranslationController.upsert.bind(masterPropertyCategoryTranslationController))
  .get(masterPropertyCategoryTranslationController.getTranslated.bind(masterPropertyCategoryTranslationController));

masterPropertyCategoryTranslationRouter.get('/:masterPropertyCategoryId/all', masterPropertyCategoryTranslationController.getAllTranslations.bind(masterPropertyCategoryTranslationController));
masterPropertyCategoryTranslationRouter.delete('/:masterPropertyCategoryId/:locale', masterPropertyCategoryTranslationController.deleteLocale.bind(masterPropertyCategoryTranslationController));

const masterPropertyTypeTranslationRouter = Router();
const masterPropertyTypeTranslationController = new MasterPropertyTypeTranslationController();

masterPropertyTypeTranslationRouter.route('/:masterPropertyTypeId')
  .put(masterPropertyTypeTranslationController.upsert.bind(masterPropertyTypeTranslationController))
  .get(masterPropertyTypeTranslationController.getTranslated.bind(masterPropertyTypeTranslationController));

masterPropertyTypeTranslationRouter.get('/:masterPropertyTypeId/all', masterPropertyTypeTranslationController.getAllTranslations.bind(masterPropertyTypeTranslationController));
masterPropertyTypeTranslationRouter.delete('/:masterPropertyTypeId/:locale', masterPropertyTypeTranslationController.deleteLocale.bind(masterPropertyTypeTranslationController));

const masterAmenityTranslationRouter = Router();
const masterAmenityTranslationController = new MasterAmenityTranslationController();

masterAmenityTranslationRouter.route('/:masterAmenityId')
  .put(masterAmenityTranslationController.upsert.bind(masterAmenityTranslationController))
  .get(masterAmenityTranslationController.getTranslated.bind(masterAmenityTranslationController));

masterAmenityTranslationRouter.get('/:masterAmenityId/all', masterAmenityTranslationController.getAllTranslations.bind(masterAmenityTranslationController));
masterAmenityTranslationRouter.delete('/:masterAmenityId/:locale', masterAmenityTranslationController.deleteLocale.bind(masterAmenityTranslationController));

const masterRoomViewTranslationRouter = Router();
const masterRoomViewTranslationController = new MasterRoomViewTranslationController();

masterRoomViewTranslationRouter.route('/:masterRoomViewId')
  .put(masterRoomViewTranslationController.upsert.bind(masterRoomViewTranslationController))
  .get(masterRoomViewTranslationController.getTranslated.bind(masterRoomViewTranslationController));

masterRoomViewTranslationRouter.get('/:masterRoomViewId/all', masterRoomViewTranslationController.getAllTranslations.bind(masterRoomViewTranslationController));
masterRoomViewTranslationRouter.delete('/:masterRoomViewId/:locale', masterRoomViewTranslationController.deleteLocale.bind(masterRoomViewTranslationController));

export { masterPropertyCategoryTranslationRouter, masterPropertyTypeTranslationRouter, masterAmenityTranslationRouter, masterRoomViewTranslationRouter };
