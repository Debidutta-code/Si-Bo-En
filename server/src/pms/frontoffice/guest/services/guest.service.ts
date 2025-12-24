// import { GuestRepository } from "../repository";
// import { successResponse, errorResponse} from "../../../../utils/return";
// import { IApiResponse } from "../../../../utils/return.types";
// import {
    
//     IAddGuestDocument,
//     ICGuest

// } from "../types";
// export class GuestService {
//     guestRepository: GuestRepository
//     constructor() {
//         this.guestRepository = new GuestRepository();
//     }
//     public async createGuest(guestData: ICGuest): Promise<IApiResponse> {
//         try {
//             console.log("Creating guest with data:", guestData);
//             const resoponse = await this.guestRepository.createGuest(guestData);
//             if (resoponse) {
//                 return successResponse("Guest Created Successfully", resoponse);
//             }
//             return errorResponse("Failed to create Guests");
//         } catch (error) {
//             console.log("Error in creating guest:", error);
//             if (error instanceof Error) {
//                 return errorResponse("Failed to create Guest", error.message)
//             }
//             return errorResponse("Failed to guests")
//         }
//     }
//     public async createNumberOfGuests(guestData:ICGuest[]):Promise<IApiResponse>{
//         try {
//             if(guestData.length===1){
//                 return this.createGuest(guestData[0])
//             }
//             const repoRes=await this.guestRepository.createNNumberOfGuests(guestData)
//             if(repoRes){
//                 return successResponse("Guest Created Successfully", repoRes);
//             }
//             return errorResponse("Failed to create Guests");
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to create Guests", error.message)
//             }
//             return errorResponse("Failed to multiple guests")
//         }
//     }
//     public async getGuestByEmail(email:string):Promise<IApiResponse>{
//         try {
//             const repoRes=await this.guestRepository.getGuestByEmail(email);
//             if(repoRes){
//                 return successResponse("Guest fetched Successfully", repoRes);
//             }
//             return errorResponse("No Guest Found with this email");
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to fetch guest", error.message)
//             }
//             return errorResponse("Failed to fetch guest")
//         }
//     }
//     public async getGuestDetailsById(id:string):Promise<IApiResponse>{
//         try {
//             const repoRes=await this.guestRepository.findGuestById(id)
            
//             if(!repoRes){
//                 return errorResponse("Guest Not found");
//             }
//             return successResponse("Guest fetched Successfully", repoRes);
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to fetch guest", error.message)
//             }
//             return errorResponse("Failed to fetch guest")
//         }
//     }
//     public async addDocumentToGuest(guestId:string,guestDocument: IAddGuestDocument):Promise<IApiResponse>{
//         try {
//             const existingGuest=await this.guestRepository.findGuestById(guestId)
//             if(!existingGuest){
//                 return errorResponse("Guest Not Found")
//             }
//             const repoRes=await this.guestRepository.addDocumentToGuests(guestId,guestDocument);
//             if(!repoRes){
//                 return errorResponse("Failed to add document to guest");
//             }
//             return successResponse("Guest fetched Successfully", repoRes);
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to fetch guest", error.message)
//             }
//             return errorResponse("Failed to fetch guest")
//         }
//     }
//     public async updateGuest(guestId:string,guestData: ICGuest):Promise<IApiResponse>{
//         try {
//             const existingGuest=await this.guestRepository.findGuestById(guestId)
//             if(!existingGuest){
//                 return errorResponse("Guest Not Found")
//             }
//             const repoRes=await this.guestRepository.updateGuestData(guestId,guestData)
//             if(!repoRes){
//                 return errorResponse("Failed to update Guest Data");
//             }
//             return successResponse("Guest Updated Successfully", repoRes);
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to Update guest", error.message)
//             }
//             return errorResponse("Failed to Update guest")
//         }
//     }
//     public async getTotalReservationsForAGuest(guestEmail:string):Promise<IApiResponse>{
//         try {
//             console.log(guestEmail);
//             const guestExist=await this.getGuestByEmail(guestEmail)
//             console.log(guestExist);
//             if(!guestExist.success){
//                 return errorResponse("Guest doesnot exist");
//             }
//             const repoRes=await this.guestRepository.getTotalReservationsForAGuest(guestEmail);
//             if(!repoRes){
//                 return errorResponse("No reservations found for the guest")
//             }
//             return successResponse("Guest Reservations fetched successfully",repoRes)
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to get reservations for guest", error.message)
//             }
//             return errorResponse("Failed to get reservations for guest")
//         }
//     }
//     public async deleteGuest(guestId:string):Promise<IApiResponse>{
//         try {
//             const  isGuestExist=await this.getGuestDetailsById(guestId)
//             if(!isGuestExist.success){
//                 return errorResponse("Guest Not Found")
//             }
//             const repoRes=await this.guestRepository.removeGuest(guestId);
//             if(!repoRes){
//                 return errorResponse("Faied to Remove guests")
//             }
//             return successResponse("Guest Deleted successfully",repoRes)
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to delete guest", error.message)
//             }
//             return errorResponse("Failed to delete  guest")
//         }
//     }
//     public async getGuestsForProperty(propertyId:string):Promise<IApiResponse>{
//         try {
//             const guests=await this.guestRepository.getGuestsForProperty(propertyId)
//             return  successResponse("Guest fetched Successfully",guests)
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to delete guest", error.message)
//             }
//             return errorResponse("Failed to delete  guest")
//         }
//     }

// }