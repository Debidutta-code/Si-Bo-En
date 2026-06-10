import { EmailOTPRepository } from '../reposititory';
import { emailQueue } from '../../index';
import { IApiResponse } from '../../utils';
import { generatePropertyTransferOTPTemplate,generatePropertyTransferSuccessTemplate } from '../templatesss';

export class PropertyEmailService {
    private otpRepository: EmailOTPRepository;
    constructor() {
        this.otpRepository = new EmailOTPRepository();
    }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    public async sendOTPForPropertyRecovery(email: string, propertyName: string): Promise<IApiResponse> {
        try {
            const existingOTP = await this.otpRepository.getOTPStatus(
                email,
                "property_recovery"
            );
            if (existingOTP && existingOTP.remainingAttempts <= 0) {
                return {
                    success: false,
                    message:
                        'Maximum OTP attempts reached. Please try again later.',
                };
            }
            const otp = this.generateOTP();
            const createOtp = await this.otpRepository.createOTP(email, otp, "property_transfer", 10);
            console.log("Generated OTP:", otp, "for email:", email,createOtp);
            const htmlContent = generatePropertyTransferOTPTemplate(otp, propertyName);
            await emailQueue.enqueueEmail({
                to: email,
                bcc: [],
                subject: "Property Transfer OTP - RevChill",
                htmlContent,
                priority: 'critical',
                meta: {
                    template: 'otp',
                    event: "property_transfer",
                },
            });
            return {
                success: true,
                message: 'OTP sent successfully to your email',
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to send OTP email',
            };

        }
    }

    public async verifyPropertyRecoveryOtp(
        email: string,
        otp: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const otpDoc = await this.otpRepository.verifyOTP(
                email,
                otp,
                "property_transfer"
            );

            if (!otpDoc) {
                return {
                    success: false,
                    message: 'Invalid or expired OTP',
                };
            }

            return {
                success: true,
                message: 'OTP verified successfully',
            };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to verify OTP',
            };
        }
    }
    public async sendPropertyRecoverySuccessEmail(email: string, propertyName: string, propertyId: string, recoveredBy: string): Promise<IApiResponse> {
        try {
            const htmlContent = generatePropertyTransferSuccessTemplate(propertyName, recoveredBy, new Date().toLocaleString(), propertyId);
            await emailQueue.enqueueEmail({
                to: email,
                bcc: [],
                subject: "Property Recovery Successful - RevChill",
                htmlContent,
                priority: 'normal',
                meta: {
                    template: 'property_recovery_success',
                    event: "property_recovery",
                },
            });
            return {
                success: true,
                message: 'Property recovery success email sent',
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to send property recovery success email',
            };
        }
    }
}
