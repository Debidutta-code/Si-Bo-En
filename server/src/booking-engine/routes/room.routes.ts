import { Router } from "express";
import { RoomBookingController } from "../controllers";

export const BookingEngineRoutes = Router();

BookingEngineRoutes.post("/fetch-rooms", RoomBookingController.fetchRooms);

