import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { TouristTaxController } from '../controllers/tourist-tax.controller';

const touristTaxRouter = Router();
const touristTaxController = new TouristTaxController();

touristTaxRouter
    .route('/')
    .post(
        protect,
        touristTaxController.createTouristTaxController.bind(
            touristTaxController
        )
    );

touristTaxRouter
    .route('/property/:propertyId')
    .get(
        touristTaxController.getTouristTaxesByPropertyIdController.bind(
            touristTaxController
        )
    );

touristTaxRouter
    .route('/:touristTaxId')
    .put(
        touristTaxController.updateTouristTaxController.bind(
            touristTaxController
        )
    )
    .delete(
        touristTaxController.deleteTouristTaxController.bind(
            touristTaxController
        )
    );

export default touristTaxRouter;
