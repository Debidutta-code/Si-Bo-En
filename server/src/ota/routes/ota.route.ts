import { Router } from "express";
import { otaUserRouter } from "../user/routes";

const otaRouter = Router();

otaRouter.use("/users",  otaUserRouter);

export {otaRouter}