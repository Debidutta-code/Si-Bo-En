import { Router } from "express";
import {partnerProtected} from "../../middleware";
import {
    AgenticRoomController
} from "../controllers";

const agenticRoomRouter = Router();
const agenticRoomController = new AgenticRoomController();

agenticRoomRouter
.route("/:propertyId")
.post( 
    partnerProtected, 
    agenticRoomController.getAgenticRooms.bind(agenticRoomController));


export {agenticRoomRouter} 