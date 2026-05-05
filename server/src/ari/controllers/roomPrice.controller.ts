// // controllers/roomRentCalculation.controller.ts

// import { PropertyRequest } from '../../utils/customRequest';
// import { Response } from 'express';
// import { errorResponse } from '../../utils/return';
// import { toUTC } from '../../utils';
// import { getGeoLocationDetails } from '../../utils/get-location.utils';
// import { RoomRentCalculationService } from '../services';
// import { getDeviceInfo } from '../../utils/device-type.util';

// export class RoomRentCalculationController {
//   public static async getRoomRentController(req: PropertyRequest, res: Response) {
//     try {
//       const {
//         propertyCode,
//         invTypeCode,
//         startDate,
//         endDate,
//         noOfChildren,
//         noOfAdults,
//         noOfRooms,
//         ratePlanCode,
//         addons,
//         promotions,
//         guestEmail // ✅ NEW: Accept loyalty guest email
//       } = req.body;

//       // Validate required fields
//       if (!propertyCode) {
//         return res.status(400).json(errorResponse('Property is not chosen'));
//       }
//       if (!invTypeCode) {
//         return res.status(400).json(errorResponse('Room type is not chosen'));
//       }
//       if (!ratePlanCode) {
//         return res.status(400).json(errorResponse('Rate plan is not chosen'));
//       }
//       if (!startDate) {
//         return res.status(400).json(errorResponse('Start date is not chosen'));
//       }
//       if (!endDate) {
//         return res.status(400).json(errorResponse('End date is not chosen'));
//       }

//       // Convert and validate guest counts
//       const adults = Number(noOfAdults) || 0;
//       const children = Number(noOfChildren) || 0;
//       const rooms = Number(noOfRooms) || 1;

//       if (adults < 1) {
//         return res.status(400).json(errorResponse('At least 1 adult is required'));
//       }
//       if (children < 0) {
//         return res.status(400).json(errorResponse("Number of children can't be less than 0"));
//       }
//       if (rooms < 1) {
//         return res.status(400).json(errorResponse('At least 1 room is required'));
//       }

//       // Get user's geo-location from IP
//       const geoDetails = await getGeoLocationDetails(req);
//       const userCountryCode = geoDetails.country !== 'Unknown' ? geoDetails.country : undefined;



//       const deviceInfo = getDeviceInfo(req);
//       const detectedDeviceType = deviceInfo.deviceType;


//       // Parse addons if provided
//       let parsedAddons;
//       if (addons && Array.isArray(addons)) {
//         parsedAddons = addons.map((addon: any) => ({
//           addonId: addon.addonId,
//           availabilityId: addon.availabilityId,
//           date: addon.date,
//           price: Number(addon.price),
//           quantity: Number(addon.quantity),
//           type: addon.type, // PostingRhythm
//           name: addon.name,
//           code: addon.code,
//         }));
//       }

//       const response = await RoomRentCalculationService.getRoomRentService(
//         propertyCode,
//         invTypeCode,
//         toUTC(startDate),
//         toUTC(endDate),
//         ratePlanCode,
//         children,
//         adults,
//         rooms,
//         guestEmail,
//         userCountryCode,
//         detectedDeviceType,
//         promotions,
//         parsedAddons
//       );

//       if (response.success) {
//         return res.status(200).json(response);
//       } else {
//         return res.status(400).json(response);
//       }
//     } catch (error: any) {
//       console.error('Error in getRoomRentController:', error);
//       return res.status(500).json(errorResponse('Internal server error', error?.message));
//     }
//   }

// }