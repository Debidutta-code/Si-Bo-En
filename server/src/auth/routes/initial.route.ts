import { Router } from "express";
import {InitDbController} from "../controller";
const initRouter=Router();
const initDBController=new InitDbController()

initRouter.route("/").get(initDBController.initDbController.bind(initDBController))
export {initRouter}