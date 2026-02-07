import { Router } from "express";
import {
    agentAuth
} from "../auth/routes/agent-auth.routes";
import { agenticPartnerRouter } from "../property/routes/agentic-property.route";
import {agenticRoomRouter} from "../property/routes/agentic-room.route"
import { agentDashboardRouter } from "../dashboard/routes";
import { agentReservationRouter } from "../reservation/routes";

const agentPlatformRouter = Router();

agentPlatformRouter.use("/auth", agentAuth);
agentPlatformRouter.use("/properties", agenticPartnerRouter);
agentPlatformRouter.use("/rooms", agenticRoomRouter);
agentPlatformRouter.use("/dashboard", agentDashboardRouter);
agentPlatformRouter.use("/reservations", agentReservationRouter);


export { agentPlatformRouter };
