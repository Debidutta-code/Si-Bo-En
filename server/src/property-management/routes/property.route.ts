import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {checkRoleBased,} from '../../middlewares/checkRole.middleware';
import {Property } from "../controller";
import {propertyAddressRoute} from "./propertyAddress.route";
import {propertyAminityRoute} from "./propertyAmenity.route";
import {paymentDetailsRoute} from "./paymentDetails.route";
import {propertyRoomRoute} from "./room.route";
import {roomAminityRoute} from "./roomAmenity.route";
import {managementRoute} from "./management.route";

export const propertyRouter = Router();
propertyRouter
  .route('/')
  .post(protect, checkRoleBased('canCreateHotel'), Property.createProperty);

propertyRouter
  .route('/:id')
  .get(protect, checkRoleBased('canViewHotel'), Property.getPropertyById)
  .patch(protect, checkRoleBased('canUpdateHotel'), Property.updatePropertyById)
  .delete(
    protect,
    checkRoleBased('canDeleteHotel'),
    Property.deletePropertyById
  );

// Property Address Routes
propertyRouter.use('/:id/address', propertyAddressRoute);


// Property Amenity Routes
propertyRouter.use('/:id/amenity', propertyAminityRoute);


// Property Payment Details Routes
propertyRouter.use('/:id/payment-details', paymentDetailsRoute);


propertyRouter.use('/:id/room', propertyRoomRoute);


propertyRouter.use('/:id/room/aminity/:roomId', roomAminityRoute);


// Management Routes
propertyRouter.use('/management', managementRoute);

// Amenity Management


export default propertyRouter;
