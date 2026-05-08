import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';

const hotelRouter = Router();

hotelRouter.get('/', HotelController.fetchHotels);
hotelRouter.get('/autocomplete/locations', HotelController.fetchAutocompleteLocations);

export { hotelRouter };
