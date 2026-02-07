import { Router } from "express";
import { agenticPartnerRouter } from "./agentic-property.route";
import { agenticRoomRouter } from "./agentic-room.route";

const route = Router();

route.use("/agentic-properties", agenticPartnerRouter);
route.use("/agentic-rooms", agenticRoomRouter);

export { route };
