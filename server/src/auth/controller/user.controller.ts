import { Response } from 'express';
import { AuthService } from '../services/userAuthentication.service';
import { CustomRequest } from '../../utils/customRequest';
import { errorResponse, successResponse } from '../../utils/return';
import { AccessService } from "../../access-control/services/access.service"
export class UserController {
  public static async getMe(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json(errorResponse('User verification failed'));
      }
      const user = await AuthService.getUserById(userId);
      if (user?.success) {
        return res.status(200).json(user);
      } else {
        return res.status(200).json(user);
      }
    } catch (error) {
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }
  public static async getUserById(req: CustomRequest, res: Response) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json(errorResponse('User verification failed'));
      }
      const user = await AuthService.getUserById(userId);
      if (user?.success) {
        return res
          .status(200)
          .json(successResponse('User data fetched successfully', user));
      } else {
        return res.status(200).json(user);
      }
    } catch (error) {
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }
  public static async getUserForMappingController(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      if (!userId || !userRole) {
        return res.status(400).json(errorResponse('User verification failed'));
      }
      const users = await AuthService.getUserForMapping(userId, userRole);
      if (users?.success) {
        return res.status(200).json(users);
      } else {
        return res.status(400).json(users);
      }
    } catch (error) {
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }
  public static async getUsersController(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const creationId = req.user?.creationId;
      if (!userId || !userRole) {
        return res.status(400).json(errorResponse('User verification failed'));
      }
      if (!creationId) {
        return res.status(400).json(errorResponse(`User is not mapped to any ${userRole === "hotel_manager" ? "Property" : userRole === "group_manager" ? "Group" : userRole === "brand_manager" ? "Brand" : "Creation"}`));
      }
      const users = await AuthService.getUserCreatedById(userId, userRole, creationId);
      if (users?.success) {
        return res.status(200).json(users);
      } else {
        return res.status(400).json(users);
      }
    } catch (error) {
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }
  public static async deleteUser(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;
      const userDetails = await AuthService.getUserById(id);
      if (
        userDetails.data.level == 0 &&
        !req?.permission?.canDeleteLevel0User
      ) {
        return res
          .status(403)
          .json(errorResponse('You did not access to delete this role'));
      } else if (
        userDetails.data.level == 1 &&
        !req?.permission?.canDeleteLevel1User
      ) {
        return res
          .status(403)
          .json(errorResponse('You did not access to delete this role'));
      } else if (
        userDetails.data.level == 2 &&
        !req?.permission?.canDeleteLevel2User
      ) {
        return res
          .status(403)
          .json(errorResponse('You did not access to delete this role'));
      } else if (
        userDetails.data.level == 3 &&
        !req?.permission?.canDeleteLevel3User
      ) {
        return res
          .status(403)
          .json(errorResponse('You did not access to delete this role'));
      }
      const deleteRes = await AuthService.deleteUser(id);
      if (deleteRes.success) {
        return res.status(200).json(deleteRes);
      } else {
        return res.status(400).json(deleteRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async updateUserById(req: CustomRequest, res: Response) {
        try {
            const id = req.params.id;
            const {
                firstName,
                lastName,
                email,
                password,
                propertyId,
                level,
            } = req.body;
            // console.log('user details', userDetails);
            if (level == 0 && !req?.permission?.canUpdateLevel0User) {
                return res
                    .status(403)
                    .json(
                        errorResponse('You did not access to update this role')
                    );
            } else if (level == 1 && !req?.permission?.canUpdateLevel1User) {
                return res
                    .status(403)
                    .json(
                        errorResponse('You did not access to update this role')
                    );
            } else if (level == 2 && !req?.permission?.canUpdateLevel2User) {
                return res
                    .status(403)
                    .json(
                        errorResponse('You did not access to update this role')
                    );
            } else if (level == 3 && !req?.permission?.canUpdateLevel3User) {
                return res
                    .status(403)
                    .json(
                        errorResponse('You did not access to update this role')
                    );
            }

            const updateRes = await AuthService.updateUserProfile({
                id,
                firstName,
                lastName,
                email,
                password,
                propertyId,
            });
            if (updateRes.success) {
                return res.status(200).json(updateRes);
            } else {
                return res.status(400).json(updateRes);
            }
        } catch (error: any) {
            // console.log(error)
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
  public static async mapUser(req: CustomRequest, res: Response) {
    try {
      const { creationId, role, userId } = req.body;
      if (!creationId || role == undefined) {
        return res
          .status(400)
          .json(errorResponse('In sufficient data to map user'));
      }
      const allRoles = await AccessService.getAllRoles()
      const roleData = allRoles.data.find((roleItem: any) => roleItem.role == role)
      // console.log("role data", roleData)
      // console.log(allRoles)
      if (!roleData) {
        return res.status(400).json(errorResponse('Role is not valid'));
      }
      const level = roleData.level;
      const mapRes = await AuthService.mapUser(userId, creationId, level);
      if (mapRes.success) {
        return res.status(200).json(mapRes);
      } else {
        return res.status(400).json(mapRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }

    public static async forgotPassword(req: CustomRequest, res: Response) {
    try {
      const { email, useLinkMethod } = req.body;
      
      if (!email) {
        return res.status(400).json(errorResponse('Email is required'));
      }

      let result;
      
      // Check if user wants link-based reset or OTP-based reset
      if (useLinkMethod) {
        result = await AuthService.sendPasswordResetLink(email);
      } else {
        result = await AuthService.sendPasswordResetOTP(email);
      }
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }

  // Verify OTP
  public static async verifyResetOTP(req: CustomRequest, res: Response) {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json(errorResponse('Email and OTP are required'));
      }

      const result = await AuthService.verifyPasswordResetOTP(email, otp);
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }

  // Reset Password
  public static async resetPassword(req: CustomRequest, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        return res.status(400).json(errorResponse('Email, OTP, and new password are required'));
      }

      const result = await AuthService.resetPassword(email, newPassword);
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }
}
