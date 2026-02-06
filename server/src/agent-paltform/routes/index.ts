import { Router } from "express";
import {
    agentAuth
} from "../auth/routes/agent-auth.routes";
import { agenticPartnerRouter } from "../property/routes/agentic-property.route";
import {agenticRoomRouter} from "../property/routes/agentic-room.route"

const agentPlatformRouter = Router();

agentPlatformRouter.use("/auth", agentAuth);
agentPlatformRouter.use("/properties", agenticPartnerRouter);
agentPlatformRouter.use("/rooms", agenticRoomRouter);


export { agentPlatformRouter };
