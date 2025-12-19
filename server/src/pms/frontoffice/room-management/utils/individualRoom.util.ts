// import {prisma} from "../../../../config";
// export const getReservationRoom=async(reservationRoomId:string)=>{
//         const individualRoom=await prisma.individualRooms.findUnique({where:{id:reservationRoomId}});
//         return individualRoom?.roomNumber || null;
// }