import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from '../utils/customRequest';
import { errorResponse } from '../utils/return';
import { prisma } from '../config';


type Permission = "pmsIntegrationActive" | "channelManagerIntegrationActive" | "selfAriActive"

export function checkeckPropertyAccessByParamsPropertyId(permission: Permission[]) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const propertyId = req.params.propertyId;
            if (!propertyId) {
                return res.status(400).json(errorResponse("PropertyId is required for this route"))
            }
            const property = await prisma.propertyConfigs.findUnique({
                where: {
                    propertyId: propertyId
                }
            })
            if (!property) {
                return res.status(400).json(errorResponse("PropertyId  not found"))

            }
            const missingPermissions = permission.filter(
                perm => !property[perm as keyof typeof property]
            );
            if (missingPermissions.length > 0) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            `Access denied: This Property does not have permission for this opeartion'`
                        )
                    );
            }

            next()
        } catch (error: any) {
            console.error('Role-based access check error:', {
                error: error.message,
                stack: error.stack,
                role: req?.user?.role,
            });
            return res
                .status(500)
                .json(
                    errorResponse('Internal server error while verifying permissions')
                );
        }

    }
}
export function checkeckPropertyAccessByParamsPropertyCode(permission: Permission[]) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const propertyCode = req.params.propertyCode;
            const propertyId = await prisma.property.findUnique({
                where: {
                    propertyCode: propertyCode
                }
            })
            if (!propertyId) {
                return res.status(400).json(errorResponse("PropertyId is required for this route"))
            }
            const property = await prisma.propertyConfigs.findUnique({
                where: {
                    propertyId: propertyId.id
                }
            })
            if (!property) {
                return res.status(400).json(errorResponse("PropertyId  not found"))

            }
            const missingPermissions = permission.filter(
                perm => !property[perm as keyof typeof property]
            );
            if (missingPermissions.length > 0) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            `Access denied: This Property does not have permission for: ${missingPermissions.join(', ')}`
                        )
                    );
            }
            next()
        } catch (error: any) {
            console.error('Role-based access check error:', {
                error: error.message,
                stack: error.stack,
                role: req?.user?.role,
            });
            return res
                .status(500)
                .json(
                    errorResponse('Internal server error while verifying permissions')
                );
        }

    }
}
export function checkeckPropertyAccessByqueryPropertyCode(permission: Permission[]) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const propertyCode = req.query.propertyCode as string;
            if (!propertyCode) {

                return res.status(400).json(errorResponse("Property Code is required for this route"))
            }
            const propertyId = await prisma.property.findUnique({
                where: {
                    propertyCode: propertyCode
                }
            })
            if (!propertyId) {
                return res.status(400).json(errorResponse("PropertyId is required for this route"))
            }
            const property = await prisma.propertyConfigs.findUnique({
                where: {
                    propertyId: propertyId.id
                }
            })
            if (!property) {
                return res.status(400).json(errorResponse("PropertyId  not found"))

            }
            const missingPermissions = permission.filter(
                perm => !property[perm as keyof typeof property]
            );
            if (missingPermissions.length > 0) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            `Access denied: This Property does not have permission for this opeartion'`
                        )
                    );
            }

            next()
        } catch (error: any) {
            console.error('Role-based access check error:', {
                error: error.message,
                stack: error.stack,
                role: req?.user?.role,
            });
            return res
                .status(500)
                .json(
                    errorResponse('Internal server error while verifying permissions')
                );
        }

    }
}
export function checkeckPropertyAccessByqueryPropertyId(permission: Permission[]) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const propertyId = req.query.propertyId as string;
            if (!propertyId) {
                return res.status(400).json(errorResponse("PropertyId is required for this route"))
            }
            const property = await prisma.propertyConfigs.findUnique({
                where: {
                    propertyId: propertyId
                }
            })
            if (!property) {
                return res.status(400).json(errorResponse("PropertyId  not found"))

            }
            const missingPermissions = permission.filter(
                perm => !property[perm as keyof typeof property]
            );
            if (missingPermissions.length > 0) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            `Access denied: This Property does not have permission for this opeartion'`
                        )
                    );
            }

            next()
        } catch (error: any) {
            console.error('Role-based access check error:', {
                error: error.message,
                stack: error.stack,
                role: req?.user?.role,
            });
            return res
                .status(500)
                .json(
                    errorResponse('Internal server error while verifying permissions')
                );
        }

    }
}

