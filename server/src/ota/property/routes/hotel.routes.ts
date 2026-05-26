import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';

const hotelRouter = Router();
const hotelController = new HotelController();
hotelRouter.get('/', hotelController.fetchHotels.bind(hotelController));
hotelRouter.get('/autocomplete/locations', hotelController.fetchAutocompleteLocations.bind(hotelController));

export { hotelRouter };
