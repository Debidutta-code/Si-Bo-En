import { protect } from "../../middlewares/auth.middleware";
import {SpaUserController} from "../controller";
import { Router } from "express";

const userSpaRouter = Router();
const spaUserController = new SpaUserController();

// Spa Users
userSpaRouter.route("/property/:propertyId/users")
    .get(protect, spaUserController.getSpaUsersForProperty.bind(spaUserController));

userSpaRouter.route("/assign")
    .post(protect, spaUserController.assignSpaToUser.bind(spaUserController));

userSpaRouter.route("/remove")
    .post(protect, spaUserController.removeUserFromSpa.bind(spaUserController));

    userSpaRouter.route("/property/:propertyId/me")
    .get(protect, spaUserController.getSpaForUser.bind(spaUserController));

export  {userSpaRouter};
