// import {
//     DashBoardRepository,
//     DashUtilsRepo

// } from "../repository";

// import {
//     IPropertyCodeAndIds
// } from "../types";
// import { successResponse, errorResponse } from "../../utils/return";
// export class DashBoardServices {
//     private dashboardRepository: DashBoardRepository;
//     private dashboardUtils: DashUtilsRepo;
//     constructor() {
//         this.dashboardRepository = new DashBoardRepository();
//         this.dashboardUtils = new DashUtilsRepo();

//     }
//     public async getPropertyIdsAndCodesServices(creationId: string, userLevel: number,propertyId?:string,propertyCode?:string,propertyName?:string) {
//         try {
//             let propertyIdAndCodes: IPropertyCodeAndIds[] = [];
//             let daoRes: any;
//             if(!propertyId&&!propertyCode&&!propertyName){

//                 switch (userLevel) {
//                     case 4:
//                         daoRes = await this.dashboardUtils.getPropertyIdsAndCodesForLevel4(creationId);
//                         break;
//                     case 3:
//                         daoRes = await this.dashboardUtils.getPropertyIdsAndCodesForLevel3(creationId);
//                         break;
//                     case 2:
//                         daoRes = await this.dashboardUtils.getPropertyIdsAndCodesForLevel2(creationId);
//                         break;
//                     case 1:
//                     case 0:
//                         daoRes = await this.dashboardUtils.getPropertyIdAndCodeForLevel0And1(creationId);
//                         break;
//                     default:
//                         return errorResponse("Invalid user Level", "user level can only be 4, 3, 2, 1, or 0");
//                 }
//                 if (!daoRes.success) {
//                     return errorResponse(daoRes.message || "Failed to fetch properties");
//                 }
//                 propertyIdAndCodes = daoRes.data;
//             }




//             // Fetch analytics data for these properties (include userLevel for top properties)
//             const analyticsData = await this.dashboardRepository.getAnalyticsData(
//                 (!propertyId && !propertyCode && !propertyName) 
//                     ? propertyIdAndCodes 
//                     : [{id: propertyId!, code: propertyCode!, name: propertyName!}], 
//                 userLevel
//             );

//             if (!analyticsData.success) {
//                 return errorResponse(analyticsData.message || "Failed to fetch analytics data");
//             }

//             return successResponse("Analytics fetched successfully", {

//                 analytics: analyticsData.data
//             });

//         } catch (error) {
//             console.error("Service error:", error);
//             return errorResponse("Failed to fetch Analytics", error instanceof Error ? error.message : "Unknown error");
//         }
//     }
//     public async getPropertyNames(creationId: string, userLevel: number) {
//         try {
//             let daoRes: any;

//             switch (userLevel) {
//                 case 4:
//                     daoRes = await this.dashboardUtils.getPropertyIdsAndCodesForLevel4(creationId);
//                     break;
//                 case 3:
//                     daoRes = await this.dashboardUtils.getPropertyIdsAndCodesForLevel3(creationId);
//                     break;
//                 case 2:
//                     daoRes = await this.dashboardUtils.getPropertyIdsAndCodesForLevel2(creationId);
//                     break;
//                 case 1:
//                 case 0:
//                     daoRes = await this.dashboardUtils.getPropertyIdAndCodeForLevel0And1(creationId);
//                     break;
//                 default:
//                     return errorResponse("Invalid user Level", "user level can only be 4, 3, 2, 1, or 0");
//             }
//             if (!daoRes.success) {
//                 return errorResponse(daoRes.message || "Failed to fetch properties");
//             }

//             return successResponse("Poperty fetched successfully",daoRes.data)
//         } catch (error) {
//             return errorResponse("Failed to fetch property Names", error instanceof Error ? error.message : "Internal server error")
//         }
//     }
// }

