import { Router } from 'express';
import { MasterPropertyCategoryTranslationController, MasterPropertyTypeTranslationController, MasterAmenityTranslationController, MasterRoomViewTranslationController } from '../../controllers/property/property-masters.controller';

const masterPropertyCategoryTranslationRouter = Router();
const masterPropertyCategoryTranslationController = new MasterPropertyCategoryTranslationController();

masterPropertyCategoryTranslationRouter.put('/:masterPropertyCategoryId', masterPropertyCategoryTranslationController.upsert.bind(masterPropertyCategoryTranslationController));
masterPropertyCategoryTranslationRouter.get('/:masterPropertyCategoryId', masterPropertyCategoryTranslationController.getTranslated.bind(masterPropertyCategoryTranslationController));
masterPropertyCategoryTranslationRouter.get('/:masterPropertyCategoryId/all', masterPropertyCategoryTranslationController.getAllTranslations.bind(masterPropertyCategoryTranslationController));
masterPropertyCategoryTranslationRouter.delete('/:masterPropertyCategoryId/:locale', masterPropertyCategoryTranslationController.deleteLocale.bind(masterPropertyCategoryTranslationController));

const masterPropertyTypeTranslationRouter = Router();
const masterPropertyTypeTranslationController = new MasterPropertyTypeTranslationController();

masterPropertyTypeTranslationRouter.put('/:masterPropertyTypeId', masterPropertyTypeTranslationController.upsert.bind(masterPropertyTypeTranslationController));
masterPropertyTypeTranslationRouter.get('/:masterPropertyTypeId', masterPropertyTypeTranslationController.getTranslated.bind(masterPropertyTypeTranslationController));
masterPropertyTypeTranslationRouter.get('/:masterPropertyTypeId/all', masterPropertyTypeTranslationController.getAllTranslations.bind(masterPropertyTypeTranslationController));
masterPropertyTypeTranslationRouter.delete('/:masterPropertyTypeId/:locale', masterPropertyTypeTranslationController.deleteLocale.bind(masterPropertyTypeTranslationController));

const masterAmenityTranslationRouter = Router();
const masterAmenityTranslationController = new MasterAmenityTranslationController();

masterAmenityTranslationRouter.put('/:masterAmenityId', masterAmenityTranslationController.upsert.bind(masterAmenityTranslationController));
masterAmenityTranslationRouter.get('/:masterAmenityId', masterAmenityTranslationController.getTranslated.bind(masterAmenityTranslationController));
masterAmenityTranslationRouter.get('/:masterAmenityId/all', masterAmenityTranslationController.getAllTranslations.bind(masterAmenityTranslationController));
masterAmenityTranslationRouter.delete('/:masterAmenityId/:locale', masterAmenityTranslationController.deleteLocale.bind(masterAmenityTranslationController));

const masterRoomViewTranslationRouter = Router();
const masterRoomViewTranslationController = new MasterRoomViewTranslationController();

masterRoomViewTranslationRouter.put('/:masterRoomViewId', masterRoomViewTranslationController.upsert.bind(masterRoomViewTranslationController));
masterRoomViewTranslationRouter.get('/:masterRoomViewId', masterRoomViewTranslationController.getTranslated.bind(masterRoomViewTranslationController));
masterRoomViewTranslationRouter.get('/:masterRoomViewId/all', masterRoomViewTranslationController.getAllTranslations.bind(masterRoomViewTranslationController));
masterRoomViewTranslationRouter.delete('/:masterRoomViewId/:locale', masterRoomViewTranslationController.deleteLocale.bind(masterRoomViewTranslationController));

export { masterPropertyCategoryTranslationRouter, masterPropertyTypeTranslationRouter, masterAmenityTranslationRouter, masterRoomViewTranslationRouter };
