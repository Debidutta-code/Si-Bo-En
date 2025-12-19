import { Router } from "express";
import {frontOfficeRoute} from "./front-desk.route";

const pmsRoute= Router();

pmsRoute.use("/front-office",frontOfficeRoute)
export {pmsRoute}