import { Router } from "express";
import { geoRatePlanRouter } from "../geo-rate-plan/routes/geo.routes";

const promotionRouter = Router();

promotionRouter.use("/geo-rate-plan", geoRatePlanRouter);

export default promotionRouter;