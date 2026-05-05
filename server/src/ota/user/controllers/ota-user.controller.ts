import { Request, Response } from "express";
import { otaProtect } from "../../../middlewares/ota-user.middleware";
import { OtaUserService } from "../services";
import { ICUser, IUUser, IUser } from "../types";
import { errorResponse, IApiResponse, IOtaCustomRequest, successResponse } from "../../../utils";


export class OtaUserController {
    private userService: OtaUserService;

    constructor() {
        this.userService = new OtaUserService();
    }

    public async registerUser(req: Request, res: Response): Promise<Response<IApiResponse>> {
        try {
            const userData: ICUser = req.body;
            const validationError = this.validateUserPayload(userData);
            if (validationError) {
                return res.status(400).json(errorResponse("Invalid user data", validationError));
            }
            const newUser = await this.userService.registerUser({
                email: userData.email.trim(),
                firstName: userData.firstName.trim(),
                lastName: userData.lastName.trim(),
                password: userData.password.trim(),
                phoneNumber: userData.phoneNumber ? userData.phoneNumber.trim() : null
            });
            return res.status(201).json(newUser);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to register user", error.message));
            }
            return res.status(500).json(errorResponse("Failed to register user", "Unknown error"));
        }
    }
    private validateUserPayload(userData: ICUser): string | null {
        const { firstName, lastName, email, password } = userData;

        if (!firstName || !lastName || !email || !password) {
            return "First name, last name, email, and password are required for creating a profile";
        }

        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        const trimmedEmail = email.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,12}$/;
        const firstNameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;
        const lastNameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;

        if (!firstNameRegex.test(trimmedFirstName)) {
            return "First name can only contain letters, hyphens, and apostrophes.";
        }

        if (!lastNameRegex.test(trimmedLastName)) {
            return "Last name can only contain letters, hyphens, and apostrophes.";
        }

        if (!emailRegex.test(trimmedEmail)) {
            return "Please provide a valid email address.";
        }

        if (!passwordRegex.test(password)) {
            return "Password must be 6–12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
        }

        return null;
    }
    private validateEmail(email: string): string | null {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? null : "Please provide a valid email address.";
    }
    private validatePassword(password: string): string | null {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,12}$/;
        if (!passwordRegex.test(password)) {
            return "Password must be 6–12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
        }

        return null;
    }
    public async verifyUser(req: Request, res: Response): Promise<Response<IApiResponse>> {
        try {
            const { email } = req.body;
            const validationError = this.validateEmail(email);
            if (validationError) {
                return res.status(400).json(errorResponse("Invalid email", validationError));
            }
            const isValid = await this.userService.getUserByEmail(email);
            return res.status(isValid.success ? 200 : 404).json(isValid);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to verify user", error.message));
            }
            return res.status(500).json(errorResponse("Failed to verify user", "Unknown error"));
        }
    }
    public async getOtaUser(req: IOtaCustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res.status(401).json(errorResponse("Authorization failed, Login again", "User not found"));
            }
            const user = await this.userService.getUserById(otaUser.id);
            return res.status(user.success ? 200 : 404).json(user);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch user details", error.message));
            }
            return res.status(500).json(errorResponse("Failed to fetch user details", "Unknown error"));
        }
    }
    public async updatePassword(req: IOtaCustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res.status(401).json(errorResponse("Authorization failed, Login again", "User not found"));
            }
            const { newPassword } = req.body;
            const validationError = this.validatePassword(newPassword);
            if (validationError) {
                return res.status(400).json(errorResponse("Invalid password", validationError));
            }
            const result = await this.userService.updateUserPassword(otaUser.id, newPassword);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update password", error.message));
            }
            return res.status(500).json(errorResponse("Failed to update password", "Unknown error"));
        }
    }
    public async updateProfileDetails(req: IOtaCustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res.status(401).json(errorResponse("Authorization failed, Login again", "User not found"));
            }
            const { firstName, lastName, phoneNumber }: IUUser = req.body;
            const result = await this.userService.updateUserDetails(otaUser.id, { firstName, lastName, phoneNumber });
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update profile details", error.message));
            }
            return res.status(500).json(errorResponse("Failed to update profile details", "Unknown error"));
        }
    }
    public async deleteUser(req: IOtaCustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res.status(401).json(errorResponse("Authorization failed, Login again", "User not found"));
            }
            const result = await this.userService.deleteUser(otaUser.id);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete user", error.message));
            }
            return res.status(500).json(errorResponse("Failed to delete user", "Unknown error"));
        }
    }
    public async loginUser(req: Request, res: Response): Promise<Response<IApiResponse>> {
        try {
            const { email, password } = req.body;
            const isValidEmail = this.validateEmail(email);
            if (!isValidEmail) {
                return res.status(400).json(errorResponse("Invalid email format", "Invalid email"));
            }
            const isValidPassword = this.validatePassword(password);
            if (!isValidPassword) {
                return res.status(400).json(errorResponse("Invalid password format", "Invalid password"));
            }
            const result = await this.userService.loginUser(email, password);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.status(200).cookie("revvChillOtaAccess", result.data).json(successResponse("Login successful"));
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to login", error.message));
            }
            return res.status(500).json(errorResponse("Failed to login", "Unknown error"));
        }
    }
}