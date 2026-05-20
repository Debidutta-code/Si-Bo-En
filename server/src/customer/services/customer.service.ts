import { successResponse, errorResponse, IApiResponse } from '../../utils';
import { CustomerRepository } from '../repository';
import { compareHash, createHash } from '../../auth/utills/bcryptHelper';
import { assignCustomerToken } from '../../auth/utills/jwtHelper';
import { config } from '../../config';

export class CustomerService {
    private customerRepository: CustomerRepository;
    constructor() {
        this.customerRepository = new CustomerRepository();
    }

    /** Register new customer */
    public async register(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<IApiResponse> {
        try {
            const existing = await this.customerRepository.findByEmail(email.toLowerCase());
            if (existing) {
                return errorResponse('Customer with this email already exists');
            }
            const hashedPassword = await createHash(password);
            const customer = await this.customerRepository.create({
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: hashedPassword,
            });
            const accessToken = assignCustomerToken(
                { id: customer.id, email: customer.email },
                config.loyaltyJWTSecret!,
                config.loyaltyJWTExpiresIn!   // same config loyalty uses
            );
            return successResponse('Registration successful', {
                customer,
                accessToken,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Registration failed', error.message);
            }
            return errorResponse('Registration failed');
        }
    }

    /** Login with email + password */
    public async login(email: string, password: string): Promise<IApiResponse> {
        try {
            const customer = await this.customerRepository.findByEmail(email.toLowerCase());
            if (!customer) {
                return errorResponse('No customer found with this email');
            }
            const isValid = await compareHash(password, customer.password);
            if (!isValid) {
                return errorResponse('Invalid password');
            }
            const accessToken = assignCustomerToken(
                { id: customer.id, email: customer.email },
                config.loyaltyJWTSecret!,
                config.loyaltyJWTExpiresIn!
            );
            return successResponse('Login successful', {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                accessToken,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Login failed', error.message);
            }
            return errorResponse('Login failed');
        }
    }

    /** Get logged-in customer profile */
    public async getMe(id: string): Promise<IApiResponse> {
        try {
            const customer = await this.customerRepository.findById(id);
            if (!customer) {
                return errorResponse('Customer not found');
            }
            return successResponse('Customer fetched successfully', customer);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch customer', error.message);
            }
            return errorResponse('Failed to fetch customer');
        }
    }

    /** Update password */
    public async updatePassword(
        email: string,
        password: string
    ): Promise<IApiResponse> {
        try {
            const customer = await this.customerRepository.findByEmail(email.toLowerCase());
            if (!customer) {
                return errorResponse('Customer not found');
            }
            const isSame = await compareHash(password, customer.password);
            if (isSame) {
                return errorResponse('New password cannot be same as current password');
            }
            const hashedPassword = await createHash(password);
            await this.customerRepository.updatePassword(email.toLowerCase(), hashedPassword);
            return successResponse('Password updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update password', error.message);
            }
            return errorResponse('Failed to update password');
        }
    }
}