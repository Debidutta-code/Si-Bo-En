import { IPropertyRecovery, IPropertyRecoveryOtpValidation } from "../types";
import { successResponse,errorResponse, IApiResponse } from "../../utils";
import {PropertyTransferRepository} from "../repository";
import { PropertyEmailService } from "../../sms-email-service/service";
export class PropertyTransferService {
    private propertyTransferRepository: PropertyTransferRepository;
    private propertyEmailService: PropertyEmailService;

    constructor() {
        this.propertyTransferRepository = new PropertyTransferRepository();
        this.propertyEmailService = new PropertyEmailService();
    }

    public async initTransferProcess(propertyCode:string,newCreationId:string): Promise<IApiResponse> {
        try {
            const [property, propertyCreation] = await Promise.all(
                [this.propertyTransferRepository.getPropertyByCode(propertyCode),
                this.propertyTransferRepository.getNewPropertyCreation(newCreationId)]
            );
            if (!property) {
                return errorResponse("Property not found");
            }
            console.log("Property found:", property);
            if(!property.isDeleted) {
                return errorResponse("Property is still active and yet not deleted");
            }
            if(!propertyCreation) {
                return errorResponse("New property creation not found");
            }
            if(propertyCreation.isDeleted) {
                return errorResponse("New property creation is deleted");
            }

            const otpRes = await this.propertyEmailService.sendOTPForPropertyRecovery(property.propertyEmail, property.propertyName);
            if(!otpRes.success){
                return errorResponse("Failed to send OTP", otpRes.message); 
            }
            return successResponse("An otp is send to the property registered email successfully", property.id);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to initialize recovery process", error.message);
            }
            return errorResponse("Failed to initialize recovery process","unknown error");
        }
    }
    public async completeTransferProcess(payload: IPropertyRecoveryOtpValidation,userEmail:string): Promise<IApiResponse> {
        try {
            const [property, propertyCreation] = await Promise.all(
                [this.propertyTransferRepository.getPropertyByCode(payload.propertyCode),
                this.propertyTransferRepository.getNewPropertyCreation(payload.newCreationId)]
            );
            if (!property) {
                return errorResponse("Property not found");
            }
            if(!property.isDeleted) {
                return errorResponse("Property is still active and yet not deleted");
            }
            if(!propertyCreation) {
                return errorResponse("New property creation not found");
            }
            if(propertyCreation.isDeleted) {
                return errorResponse("New property creation is deleted");
            }

            const otpRes = await this.propertyEmailService.verifyPropertyRecoveryOtp(property.propertyEmail, payload.otp);
            if (!otpRes.success) {
                return errorResponse("Failed to verify OTP", otpRes.message);
            }
            const completeRecovery = await this.propertyTransferRepository.recoverProperty(property.id, property.creationId, propertyCreation.id);
            if (!completeRecovery) {
                return errorResponse("Failed to complete recovery process");
            }
            await this.propertyEmailService.sendPropertyRecoverySuccessEmail(property.propertyEmail, property.propertyName, property.id, userEmail);
            return successResponse("Property recovery process completed successfully", property.id);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to complete recovery process", error.message);
            }
            return errorResponse("Failed to complete recovery process", "unknown error");
        }
    }
}
