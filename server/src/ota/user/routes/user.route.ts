import { Router } from "express";
import { OtaUserController } from "../controllers";
import router from "../../../sms-email-service/routes/route";

const otaUserRouter = Router();
const userController = new OtaUserController();

otaUserRouter.route("/")
    .post(userController.registerUser.bind(userController))
    .get(userController.getOtaUser.bind(userController))
    .put(userController.updateProfileDetails.bind(userController))
    .delete(userController.deleteUser.bind(userController));
otaUserRouter.route("/verify")
    .post(userController.verifyUser.bind(userController));
otaUserRouter.route("/password")
    .put(userController.updatePassword.bind(userController));
export { otaUserRouter };
