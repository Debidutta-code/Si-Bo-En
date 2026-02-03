import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
  checkRoleBased,
  addRoleBasedDetails,
  checkMultiplePermissions,
} from '../../middlewares/checkRole.middleware';
import {
  Category,
  PropertyType,
  AminityController,
  RoomAminityControllerManagement,
  LoyaltyGuestFieldControllers
} from "../controller";

export const managementRoute = Router();
const categoryRouter = Router();
const propertyTypeRouter = Router();
const destinationRouter = Router();
 const aminityRouter = Router();
const roomAminityRouteM = Router();
const loyaltyGuestFieldRouter = Router();
managementRoute.use('/category', categoryRouter);
managementRoute.use('/amenity', aminityRouter);
managementRoute.use('/type', propertyTypeRouter);
managementRoute.use('/destination-type', destinationRouter);
managementRoute.use('/loyalty-guest-field', loyaltyGuestFieldRouter);

categoryRouter
  .route('/get')
  .get(
    protect,
    checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
    Category.getCategory
  );

categoryRouter
  .route('/create')
  .post(protect, checkRoleBased('canCDCategory'), Category.createCategory);

categoryRouter
  .route('/delete/:categoryName')
  .delete(protect, checkRoleBased('canCDCategory'), Category.deleteCategory);
propertyTypeRouter
  .route('/get')
  .get(
    protect,
    checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
    PropertyType.getPropertyTypeController
  );

propertyTypeRouter
  .route('/create')
  .post(
    protect,
    checkRoleBased('canCDPropertyType'),
    PropertyType.createPropertyTypeController
  );

propertyTypeRouter
  .route('/delete/:propertyTypeName')
  .delete(
    protect,
    checkRoleBased('canCDPropertyType'),
    PropertyType.deletePropertyTypeController
  );

aminityRouter
  .route('/get')
  .get(
    protect,
    checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
    AminityController.getAmenities
  );

aminityRouter
  .route('/create')
  .post(
    protect,
    checkRoleBased('canCDAmenity'),
    AminityController.createAminity
  );

aminityRouter
  .route('/update')
  .patch(
    protect,
    checkRoleBased('canCDAmenity'),
    AminityController.deleteAmenities
  );

aminityRouter.use('/room', roomAminityRouteM);
roomAminityRouteM
  .route('/get')
  .get(
    protect,
    checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
    RoomAminityControllerManagement.getRoomAmenities
  );

roomAminityRouteM
  .route('/create')
  .post(
    protect,
    checkRoleBased('canCDAmenity'),
    RoomAminityControllerManagement.createRoomAminity
  );

roomAminityRouteM
  .route('/update')
  .patch(
    protect,
    checkRoleBased('canCDAmenity'),
    RoomAminityControllerManagement.deleteRoomAmenities
  );
  


loyaltyGuestFieldRouter.route("/")
  .post(
    LoyaltyGuestFieldControllers.createLoyaltyGuestFields
  ).get(
    LoyaltyGuestFieldControllers.getLoyaltyGuestFields
  );
  loyaltyGuestFieldRouter.route("/:id").post(
    LoyaltyGuestFieldControllers.deleteLoyaltyGuestFields
  );