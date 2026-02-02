// import {
//     addRoomsForAgenticProperty,
//     createAgenticRoom,
//     getRoomsForAgenticProperty,
//     removeRoomsFromAgencies,
//     updateAgenticRoomAvailability
// } from "../api";
// import type { IAgenticRoom } from "../interfaces";

// export type {
//     IAgenticRoom,
//     ICAgenticRoom
// } from "../interfaces/agentic-room.type";

// export const addRoomsForAgenticPropertyService = async (propertyId: string, rooms: IAgenticRoom[]) => {
//     try {
//         const response = await addRoomsForAgenticProperty(propertyId, rooms);
//         return {
//             success: true,
//             data: response
//         };
//     } catch (error) {
//         return {
//             success: false,
//             message: "Failed to add rooms for agentic property, try again later"
//         };
//     }
// };
// export const createAgenticRoomService = async (data: ICA) => {
//     try {
//         if(!data.agenticPropertyId) {
//             return {
//                 success: false,
//                 message: "Agentic property  is not choosen"
//             };
//         }
//         if(!data.roomId){

//         }
//         const response = await createAgenticRoom(data);
//         return {
//             success: true,
//             data: response
//         };
//     } catch (error) {
//         return {
//             success: false,
//             message: "Failed to create agentic room, try again later"
//         };
//     }
// };
