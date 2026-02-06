import { Router } from "express";
import {
    agentAuth
} from "../auth/routes/agent-auth.routes";
import { 
    agenticPropertyRouter,
    agenticRoomRouter
 } from "../../agency/routes";
const agentPlatformRouter = Router();

agentPlatformRouter.use("/auth", agentAuth);
agentPlatformRouter.use("/properties", agenticPropertyRouter);
agentPlatformRouter.use("/rooms", agenticRoomRouter);


export { agentPlatformRouter };
