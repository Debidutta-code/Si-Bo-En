// import { DashBoardServices } from "../services";
// import { CustomRequest } from "../../utils/customRequest";
// import { successResponse, errorResponse } from "../../utils/return";
// import { Response } from "express";
// export class DashBoardController {
//     private dashboardServices: DashBoardServices;
//     constructor() {
//         this.dashboardServices = new DashBoardServices();

//     }
//     public async getAnalytics(req: CustomRequest, res: Response): Promise<Response> {
//         try {
//             if (!req.user?.creationId || !req.user.level) {
//                 return res.status(400).json(errorResponse("user is not Assigned to any creation", "Creation Id Not found"));
//             }
//             const { propertyId, propertyCode, propertyName } = req.query
//             const serRes = await this.dashboardServices.getPropertyIdsAndCodesServices(req.user.creationId, req.user.level, propertyId && propertyId.toString(), propertyCode && propertyCode.toString(), propertyName && propertyName.toString())
//             return res.status(serRes.success ? 200 : 400).json(serRes)
//         } catch (error) {
//             if (error instanceof Error) {
//                 return res.status(500).json(errorResponse("Failed to fetch Analytics", error.message))
//             }
//             return res.status(500).json(errorResponse("Internal Server Error"))
//         }
//     }
//     public async getPropertyNames(req: CustomRequest, res: Response): Promise<Response> {
//         try {
//             if (!req.user?.creationId || !req.user.level) {
//                 return res.status(400).json(errorResponse("user is not Assigned to any creation", "Creation Id Not found"));
//             }
//             const serRes = await this.dashboardServices.getPropertyNames(req.user.creationId, req.user.level)
//             return res.status(serRes.success ? 200 : 400).json(serRes)
//         } catch (error) {
//             if (error instanceof Error) {
//                 return res.status(500).json(errorResponse("Failed to fetch Analytics", error.message))
//             }
//             return res.status(500).json(errorResponse("Internal Server Error"))
//         }
//     }

// }
