import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { AgenticRoomController } from "../controllers";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

const agenticRoomRouter = Router();
const agenticRoomController = new AgenticRoomController();


agenticRoomRouter.route("/")
    .post(protect, agenticRoomController.createRoomsForAgent.bind(agenticRoomController))
    .put(protect, agenticRoomController.updateAgenticRoomAvailability.bind(agenticRoomController));


agenticRoomRouter.route("/rooms-for-agency/:agenticPropertyId/:propertyId")
    .get(protect,
        attachPropertyDetails({
            identifierType: "id",
            key: "propertyId",
            source: "params"
        }),
        agenticRoomController.getRoomsForAgencies.bind(agenticRoomController));

agenticRoomRouter.route("/remove-rooms-for-agency/:agenticPropertyId/:agenticRoomId")
    .put(protect, agenticRoomController.removeAgenticRoom.bind(agenticRoomController));
agenticRoomRouter.route("/add-rooms-to-agency")
    .post(protect, agenticRoomController.addRoomsToAgencies.bind(agenticRoomController));

export { agenticRoomRouter };