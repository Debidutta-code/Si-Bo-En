import { Router } from 'express';
import { PropertyWishController } from '../controller/property-wish.controller';
import { customerProtect } from '../../../middlewares/customer-auth.middleware';

const propertyWishlistRouter = Router();
const propertyWishController = new PropertyWishController();

propertyWishlistRouter.use(customerProtect);

propertyWishlistRouter
    .route('/')
    .post(propertyWishController.addToWishlist.bind(propertyWishController))
    .get(
        propertyWishController.getWishlistForUser.bind(propertyWishController)
    );

propertyWishlistRouter
    .route('/:propertyId')
    .delete(
        propertyWishController.removeFromWishlist.bind(propertyWishController)
    );

export { propertyWishlistRouter };
