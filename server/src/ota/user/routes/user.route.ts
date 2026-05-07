import { Router } from "express";
import { OtaUserController } from "../controllers";
import router from "../../../sms-email-service/routes/route";
import { otaProtect } from "../../../middlewares/ota-user.middleware";

const otaUserRouter = Router();
const userController = new OtaUserController();

otaUserRouter.route("/login").post(userController.loginUser.bind(userController)),
    otaUserRouter.route("/")
        .post(userController.registerUser.bind(userController))
        .get(userController.getOtaUser.bind(userController))
        .put(userController.updateProfileDetails.bind(userController))
        .delete(userController.deleteUser.bind(userController));
otaUserRouter.route("/verify")
    .post(userController.verifyUser.bind(userController));
otaUserRouter.route("/password")
    .put(otaProtect,userController.updatePassword.bind(userController));
    otaUserRouter.route("/login")
    .post(userController.loginUser.bind(userController));
export { otaUserRouter };
