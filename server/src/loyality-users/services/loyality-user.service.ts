import {
    IApiResponse,
    successResponse,
    errorResponse,
    assignLoyaltyToken,
} from '../../utils';
import { LoyalityLoginRepository } from '../repository';
import { compareHash, createHash } from '../../auth/utills/bcryptHelper';
import { config } from '../../config';
import { EmailService } from '../../sms-email-service/service';

export class LoyalityUserService {
    private loyalityLoginRepository: LoyalityLoginRepository;
    private emailService: EmailService;
    constructor() {
        this.loyalityLoginRepository = new LoyalityLoginRepository();
        this.emailService = new EmailService();
    }

    public async getMe(id: string): Promise<IApiResponse> {
        return this.getByUserId(id);
    }

    public async getByUserId(id: string): Promise<IApiResponse> {
        try {
            const loyalityGuest =
                await this.loyalityLoginRepository.getByUserId(id);
            return successResponse(
                'Loyality guest fetched successfully',
                loyalityGuest
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occured while fetching loyality guest',
                    error.message
                );
            }
            return errorResponse('Error occured while fetching loyality guest');
        }
    }
}
