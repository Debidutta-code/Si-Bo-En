import {RoomRentCalculationController} from "../controllers";
import { Router } from 'express';

export const roomRentPriceRouter = Router();

roomRentPriceRouter.route('/get-price').post(RoomRentCalculationController.getRoomRentController)
