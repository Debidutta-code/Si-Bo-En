import { Router } from "express"
import CreationController, { fetchCreationAndPropertyDetails } from "../controller/creation.controller"
import { protect } from "../../middlewares/auth.middleware";
const creationRoute = Router()

creationRoute.route("/").post(protect, CreationController.createController)
creationRoute.route("/:id").put(protect, CreationController.updateController)
creationRoute.route("/toggleDraft/:id").put(protect, CreationController.toggleDraftController)
creationRoute.route("/getAll").get(protect, CreationController.getAllController)
creationRoute.route("/getDetails/creationId").get(protect, fetchCreationAndPropertyDetails.byCreationId)
creationRoute.route("/getDetails/byUserId").get(protect, fetchCreationAndPropertyDetails.byUserId)
creationRoute.route("/getCreations").get(protect, CreationController.getCrationByRole);
creationRoute.route("/getSpecificCreation/:creationId").get(protect, CreationController.getSpecificCreation);
export default creationRoute;

