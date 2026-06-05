import { ActivityAction, ActivityEntity } from '../logs/model/activity.model';
import { IActivityConfig } from './activityLogger';
import { CustomRequest } from './customRequest';
import { AgentRequest } from '../agent-paltform/utils';
import {
    createCRUDConfig,
    createAuthConfig,
    createSimpleConfig,
    createCheckInOutConfig,
    createPaymentConfig,
    createPromotionConfig,
    createToggleStatusConfig,
    createLoyaltyConfig,
    createPropertySubResourceConfig,
    createRoomSubResourceConfig,
    createTaxConfig,
    createManagementConfig,
    createVideoConfig,
    logOnlySuccess,
} from './activityLoggerHelpers';

interface RoutePattern {
    pattern: RegExp;
    method?: string | string[];
    config: IActivityConfig;
}

export const ACTIVITY_LOGGER_ROUTES: RoutePattern[] = [
    // ==================== AUTH ====================
    {
        pattern: /\/api\/v1\/auth\/login$/,
        method: 'POST',
        config: createAuthConfig(
            ActivityAction.LOGIN,
            (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const email = req.body?.email || 'unknown';
                return isSuccess
                    ? `User ${email} logged in successfully`
                    : `Failed login attempt for ${email}`;
            },
            ['login', 'security']
        ),
    },
    {
        pattern: /\/api\/v1\/auth\/logout$/,
        method: 'POST',
        config: createAuthConfig(
            ActivityAction.LOGOUT,
            req =>
                `User ${(req as CustomRequest).user?.email || 'unknown'} logged out`
        ),
    },

    // ==================== USER ====================
    {
        pattern: /\/api\/v1\/auth\/create-user$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.USER, 'email')[0],
    },
    {
        pattern: /\/api\/v1\/user\/forgot-password$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.USER,
            success =>
                success
                    ? 'Password reset OTP sent successfully'
                    : 'Failed to send password reset OTP',
            ['user', 'password-reset', 'security']
        ),
    },
    {
        pattern: /\/api\/v1\/user\/verify-reset-otp$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.USER,
            success =>
                success
                    ? 'Reset OTP verified successfully'
                    : 'Failed to verify reset OTP',
            ['user', 'otp-verification', 'security']
        ),
    },
    {
        pattern: /\/api\/v1\/user\/reset-password$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.USER,
            success =>
                success
                    ? 'Password reset successfully'
                    : 'Failed to reset password',
            ['user', 'password-reset', 'security']
        ),
    },
    {
        pattern: /\/api\/v1\/user\/assignUserToProperty$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.USER,
            success =>
                success
                    ? 'User assigned to property successfully'
                    : 'Failed to assign user to property',
            ['user', 'property-assignment']
        ),
    },
    {
        pattern: /\/api\/v1\/user\/update\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.USER, 'email')[1],
    },
    {
        pattern: /\/api\/v1\/user\/delete\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.USER, 'email')[2],
    },

    // ==================== PROPERTY ====================
    {
        pattern: /\/api\/v1\/property-management\/property$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.PROPERTY, 'propertyName')[0],
    },
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+$/,
        method: ['PUT', 'PATCH'],
        config: createCRUDConfig(ActivityEntity.PROPERTY, 'propertyName')[1],
    },
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.PROPERTY, 'propertyName')[2],
    },

    // Property Address
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+\/address$/,
        method: 'POST',
        config: createPropertySubResourceConfig(
            'address',
            ActivityAction.CREATE
        ),
    },
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+\/address$/,
        method: 'PUT',
        config: createPropertySubResourceConfig(
            'address',
            ActivityAction.UPDATE
        ),
    },
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+\/address$/,
        method: 'DELETE',
        config: createPropertySubResourceConfig(
            'address',
            ActivityAction.DELETE
        ),
    },

    // Property Amenity
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+\/amenity$/,
        method: 'POST',
        config: createPropertySubResourceConfig(
            'amenity',
            ActivityAction.CREATE
        ),
    },
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+\/amenity$/,
        method: 'PUT',
        config: createPropertySubResourceConfig(
            'amenity',
            ActivityAction.UPDATE
        ),
    },
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+\/amenity$/,
        method: 'DELETE',
        config: createPropertySubResourceConfig(
            'amenity',
            ActivityAction.DELETE
        ),
    },

    // Property Config
    {
        pattern: /\/api\/v1\/property-management\/config\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Property configuration updated successfully'
                    : 'Failed to update property configuration',
            ['property', 'config', 'update']
        ),
    },

    // Property Videos
    {
        pattern:
            /\/api\/v1\/property-management\/property\/video\/property\/[^/]+$/,
        method: 'POST',
        config: createVideoConfig('property', ActivityAction.CREATE),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/video\/property\/[^/]+$/,
        method: 'DELETE',
        config: createVideoConfig('property', ActivityAction.DELETE),
    },

    // ==================== ROOM ====================
    {
        pattern: /\/api\/v1\/property-management\/property\/[^/]+\/room$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.ROOM, 'roomName')[0],
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/[^/]+\/room\/[^/]+$/,
        method: 'GET',
        config: createSimpleConfig(
            ActivityAction.EXPORT,
            ActivityEntity.ROOM,
            success =>
                success
                    ? 'Room details retrieved'
                    : 'Failed to retrieve room details',
            ['room', 'export']
        ),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/[^/]+\/room\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.ROOM, 'roomName')[1],
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/[^/]+\/room\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.ROOM, 'roomName')[2],
    },

    // Room Amenity
    {
        pattern:
            /\/api\/v1\/property-management\/property\/[^/]+\/room\/aminity\/[^/]+$/,
        method: 'POST',
        config: createRoomSubResourceConfig('amenity', ActivityAction.CREATE),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/[^/]+\/room\/aminity\/[^/]+$/,
        method: 'PUT',
        config: createRoomSubResourceConfig('amenity', ActivityAction.UPDATE),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/[^/]+\/room\/aminity\/[^/]+$/,
        method: 'DELETE',
        config: createRoomSubResourceConfig('amenity', ActivityAction.DELETE),
    },

    // Room Videos
    {
        pattern:
            /\/api\/v1\/property-management\/property\/video\/room\/[^/]+$/,
        method: 'POST',
        config: createVideoConfig('room', ActivityAction.CREATE),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/video\/room\/[^/]+$/,
        method: 'DELETE',
        config: createVideoConfig('room', ActivityAction.DELETE),
    },

    // ==================== RESERVATION ====================
    {
        pattern: /\/api\/v1\/reservations$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.RESERVATION,
            getEntityId: (req, resBody) =>
                resBody?.data?.id || resBody?.data?.reservationId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.reservationCode || resBody?.data?.guestName,
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                return isSuccess
                    ? `Reservation created for ${req.body?.guestName || 'guest'}`
                    : `Failed to create reservation`;
            },
            tags: ['booking', 'reservation-creation'],
        },
    },
    {
        pattern: /\/api\/v1\/reservation\/update\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(
            ActivityEntity.RESERVATION,
            'reservationCode'
        )[1],
    },
    {
        pattern: /\/api\/v1\/reservation\/cancel\/[^/]+$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CANCEL,
            ActivityEntity.RESERVATION,
            success =>
                success
                    ? 'Reservation cancelled successfully'
                    : 'Failed to cancel reservation',
            ['booking', 'cancellation']
        ),
    },
    {
        pattern: /\/api\/v1\/reservation\/no-show\/[^/]+$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.RESERVATION,
            success =>
                success
                    ? 'Reservation marked as no-show'
                    : 'Failed to mark reservation as no-show',
            ['booking', 'no-show']
        ),
    },

    // ==================== PMS FRONT-OFFICE RESERVATIONS ====================
    {
        pattern: /\/api\/v1\/pms\/front-office\/reservations$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.RESERVATION,
            getEntityId: (req, resBody) =>
                resBody?.data?.id || resBody?.data?.reservationId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.reservationCode || resBody?.data?.guestName,
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                return isSuccess
                    ? `PMS Reservation created for ${req.body?.data?.guestDetails?.firstName || 'guest'}`
                    : `Failed to create PMS reservation`;
            },
            tags: ['pms', 'front-office', 'reservation-creation'],
        },
    },
    {
        pattern: /\/api\/v1\/pms\/front-office\/reservations\/update\/[^/]+$/,
        method: 'PATCH',
        config: createCRUDConfig(
            ActivityEntity.RESERVATION,
            'reservationCode'
        )[1],
    },
    {
        pattern: /\/api\/v1\/pms\/front-office\/reservations\/cancel\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.CANCEL,
            ActivityEntity.RESERVATION,
            success =>
                success
                    ? 'PMS Reservation cancelled successfully'
                    : 'Failed to cancel PMS reservation',
            ['pms', 'front-office', 'cancellation']
        ),
    },
    {
        pattern: /\/api\/v1\/pms\/front-office\/reservations\/no-show\/[^/]+$/,
        method: 'PATCH',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.RESERVATION,
            success =>
                success
                    ? 'PMS Reservation marked as no-show'
                    : 'Failed to mark PMS reservation as no-show',
            ['pms', 'front-office', 'no-show']
        ),
    },

    {
        pattern: /\/api\/v1\/booking-engine\/reservation\/[^/]+\/checkin$/,
        method: 'POST',
        config: createCheckInOutConfig(ActivityAction.CHECKIN),
    },
    {
        pattern: /\/api\/v1\/booking-engine\/reservation\/[^/]+\/checkout$/,
        method: 'POST',
        config: createCheckInOutConfig(ActivityAction.CHECKOUT),
    },
    // {
    //     pattern: /\/api\/v1\/booking-engine\/fetch-rooms$/,
    //     method: 'POST',
    //     config: createSimpleConfig(
    //         ActivityAction.EXPORT,
    //         ActivityEntity.ROOM,
    //         (success) => success ? 'Available rooms fetched successfully' : 'Failed to fetch available rooms',
    //         ['booking-engine', 'availability', 'export']
    //     )
    // },

    // ==================== PAYMENT ====================
    {
        pattern: /\/api\/v1\/booking-engine\/payment$/,
        method: 'POST',
        config: createPaymentConfig(ActivityEntity.PAYMENT),
    },
    {
        pattern: /\/api\/v1\/booking-engine\/refund$/,
        method: 'POST',
        config: createPaymentConfig(ActivityEntity.REFUND),
    },
    {
        pattern: /\/api\/v1\/payment-details$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.PAYMENT,
            success =>
                success
                    ? 'Payment details created successfully'
                    : 'Failed to create payment details',
            ['payment', 'payment-details', 'create']
        ),
    },
    {
        pattern: /\/api\/v1\/payment-details$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.PAYMENT,
            success =>
                success
                    ? 'Payment details updated successfully'
                    : 'Failed to update payment details',
            ['payment', 'payment-details', 'update']
        ),
    },

    // ==================== INVENTORY & PRICING ====================
    {
        pattern: /\/api\/v1\/property-management\/inventory$/,
        method: ['POST', 'PUT'],
        config: {
            ...createSimpleConfig(
                ActivityAction.UPDATE,
                ActivityEntity.INVENTORY,
                success =>
                    success ? 'Inventory updated' : 'Inventory update failed',
                ['inventory']
            ),
            shouldLog: logOnlySuccess,
        },
    },
    {
        pattern: /\/api\/v1\/ari\/inventory\/create\/[^/]+$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Inventory created successfully'
                    : 'Failed to create inventory',
            ['inventory', 'create']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/inventory\/map\/rateplan\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Rate plan mapped to inventory'
                    : 'Failed to map rate plan',
            ['inventory', 'rate-plan', 'mapping']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/inventory\/update\/price$/,
        method: 'PUT',
        config: {
            ...createSimpleConfig(
                ActivityAction.UPDATE,
                ActivityEntity.INVENTORY,
                success =>
                    success
                        ? 'Inventory price updated'
                        : 'Inventory price update failed',
                ['inventory', 'pricing']
            ),
            shouldLog: logOnlySuccess,
        },
    },
    {
        pattern: /\/api\/v1\/ari\/inventory\/update-or-create\/charges$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Inventory charges updated'
                    : 'Failed to update inventory charges',
            ['inventory', 'charges', 'update']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/analysis\/calendar$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.EXPORT,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Calendar availability retrieved'
                    : 'Failed to retrieve calendar availability',
            ['availability', 'calendar', 'export']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/start-stop-sell\/[^/]+$/,
        method: 'PATCH',
        config: {
            ...createSimpleConfig(
                ActivityAction.UPDATE,
                ActivityEntity.INVENTORY,
                success =>
                    success
                        ? 'Sell status updated'
                        : 'Failed to update sell status',
                ['start-stop-sell', 'inventory', 'ari']
            ),
            shouldLog: logOnlySuccess,
        },
    },

    // ==================== RATE PLAN ====================
    {
        pattern: /\/api\/v1\/ari\/rate-plan$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.RATE_PLAN, 'name')[0],
    },
    {
        pattern: /\/api\/v1\/ari\/rate-plan\/[^/]+$/,
        method: ['PUT', 'PATCH'],
        config: createCRUDConfig(ActivityEntity.RATE_PLAN, 'name')[1],
    },
    {
        pattern: /\/api\/v1\/ari\/rate-plan\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.RATE_PLAN, 'name')[2],
    },
    {
        pattern: /\/api\/v1\/ari\/rate-plan\/add\/tax$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.RATE_PLAN,
            success =>
                success
                    ? 'Tax added to rate plan'
                    : 'Failed to add tax to rate plan',
            ['rate-plan', 'tax', 'mapping']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/rate-plan\/remove\/tax$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.RATE_PLAN,
            success =>
                success
                    ? 'Tax removed from rate plan'
                    : 'Failed to remove tax from rate plan',
            ['rate-plan', 'tax', 'mapping']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/rate-plan-with-addon$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.RATE_PLAN,
            success =>
                success
                    ? 'Addon added to rate plan'
                    : 'Failed to add addon to rate plan',
            ['rate-plan', 'addon', 'mapping']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/rate-plan-with-addon$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.RATE_PLAN,
            success =>
                success
                    ? 'Addon removed from rate plan'
                    : 'Failed to remove addon from rate plan',
            ['rate-plan', 'addon', 'mapping']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/cta-ctd\/apply$/,
        method: 'POST',
        config: {
            ...createSimpleConfig(
                ActivityAction.UPDATE,
                ActivityEntity.RATE_PLAN,
                success =>
                    success
                        ? 'Restrictions applied'
                        : 'Failed to apply restrictions',
                ['restriction', 'rate-plan', 'cta', 'ctd']
            ),
            shouldLog: logOnlySuccess,
        },
    },
    {
        pattern: /\/api\/v1\/addon\/addons$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.ADDON, 'name')[0],
    },
    {
        pattern: /\/api\/v1\/addon\/addons\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.ADDON, 'name')[1],
    },
    {
        pattern: /\/api\/v1\/addon\/addons\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.ADDON, 'name')[2],
    },
    {
        pattern: /\/api\/v1\/addon\/addon-datewise$/,
        method: 'POST',
        config: createCRUDConfig(
            ActivityEntity.ADDON_AVAILABILITY,
            'addonName'
        )[0],
    },
    {
        pattern: /\/api\/v1\/addon\/addon-datewise\/addon\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(
            ActivityEntity.ADDON_AVAILABILITY,
            'addonName'
        )[1],
    },
    {
        pattern: /\/api\/v1\/addon\/addon-datewise\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(
            ActivityEntity.ADDON_AVAILABILITY,
            'addonName'
        )[1],
    },
    {
        pattern: /\/api\/v1\/addon\/addon-datewise\/addon\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(
            ActivityEntity.ADDON_AVAILABILITY,
            'addonName'
        )[2],
    },
    {
        pattern: /\/api\/v1\/addon\/addon-datewise\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(
            ActivityEntity.ADDON_AVAILABILITY,
            'addonName'
        )[2],
    },

    // ==================== AGENCY ====================
    {
        pattern: /\/api\/v1\/agency\/agencies$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.AGENCY, 'name')[0],
    },
    {
        pattern: /\/api\/v1\/agency\/agencies\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.AGENCY, 'name')[1],
    },
    {
        pattern: /\/api\/v1\/agency\/agencies\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.AGENCY, 'name')[2],
    },

    // ==================== AGENT ====================
    {
        pattern: /\/api\/v1\/agency\/agents\/login$/,
        method: 'POST',
        config: {
            action: ActivityAction.LOGIN,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) => resBody?.data?.agentId || 'unknown',
            getEntityName: (req, resBody) => req.body?.email || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const email = req.body?.email || 'unknown';
                return isSuccess
                    ? `Agent ${email} logged in successfully`
                    : `Failed login attempt for agent ${email}`;
            },
            tags: ['agent', 'login', 'authentication', 'security'],
        },
    },
    {
        pattern: /\/api\/v1\/agency\/agents$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.AGENT, 'email')[0],
    },
    {
        pattern: /\/api\/v1\/agency\/agents\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.AGENT, 'email')[1],
    },
    {
        pattern: /\/api\/v1\/agency\/agents\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.AGENT, 'email')[2],
    },
    {
        pattern: /\/api\/v1\/agent-platform\/auth\/login$/,
        method: 'POST',
        config: {
            action: ActivityAction.LOGIN,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) => resBody?.data?.agentId || 'unknown',
            getEntityName: (req, resBody) => req.body?.email || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const email = req.body?.email || 'unknown';
                return isSuccess
                    ? `Agent ${email} logged in successfully`
                    : `Failed login attempt for agent ${email}`;
            },
            tags: ['agent', 'login', 'authentication', 'security'],
        },
    },
    {
        pattern: /\/api\/v1\/agent-auth\/logout$/,
        method: 'POST',
        config: {
            action: ActivityAction.LOGOUT,
            entity: ActivityEntity.AGENT,
            getEntityId: req => (req as AgentRequest).agent?.id || 'unknown',
            getEntityName: req =>
                (req as AgentRequest).agent?.agentEmail || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const email =
                    (req as AgentRequest).agent?.agentEmail || 'unknown';
                return isSuccess
                    ? `Agent ${email} logged out successfully`
                    : `Failed logout attempt for agent ${email}`;
            },
            tags: ['agent', 'logout', 'authentication', 'security'],
        },
    },

    // ==================== ACCESS CONTROL ====================
    {
        pattern: /\/api\/v1\/access\/createNewRole$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.ACCESS_CONTROL,
            success =>
                success
                    ? 'New role created successfully'
                    : 'Failed to create role',
            ['access-control', 'role-management', 'create', 'security']
        ),
    },
    {
        pattern: /\/api\/v1\/access\/modify\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.ACCESS_CONTROL,
            success =>
                success
                    ? 'Access permissions updated'
                    : 'Failed to update access',
            [
                'access-control',
                'role-management',
                'update',
                'permissions',
                'security',
            ]
        ),
    },
    {
        pattern: /\/api\/v1\/access\/delete\/[^/]+$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.DELETE,
            ActivityEntity.ACCESS_CONTROL,
            success =>
                success ? 'Role deleted successfully' : 'Failed to delete role',
            ['access-control', 'role-management', 'delete', 'security']
        ),
    },

    // ==================== TAX SYSTEM ====================
    {
        pattern: /\/api\/v1\/tax-system\/rules$/,
        method: 'POST',
        config: createTaxConfig('tax rule')[0],
    },
    {
        pattern: /\/api\/v1\/tax-system\/groups$/,
        method: 'POST',
        config: createTaxConfig('tax group')[0],
    },
    {
        pattern: /\/api\/v1\/tax-system\/groups\/[^/]+$/,
        method: 'PUT',
        config: createTaxConfig('tax group')[1],
    },
    {
        pattern: /\/api\/v1\/tax-system\/groups\/[^/]+$/,
        method: 'DELETE',
        config: createTaxConfig('tax group')[2],
    },
    {
        pattern: /\/api\/v1\/tax-system\/groups\/[^/]+\/add-rules$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.TAX_GROUP,
            success =>
                success
                    ? 'Tax rules added to group'
                    : 'Failed to add tax rules',
            ['tax', 'tax-group', 'update']
        ),
    },
    {
        pattern: /\/api\/v1\/tax-system\/groups\/[^/]+\/remove-rules$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.TAX_GROUP,
            success =>
                success
                    ? 'Tax rules removed from group'
                    : 'Failed to remove tax rules',
            ['tax', 'tax-group', 'update']
        ),
    },
    {
        pattern: /\/api\/v1\/tax-system\/rules$/,
        method: 'POST',
        config: createTaxConfig('tax rule')[0],
    },
    {
        pattern: /\/api\/v1\/tax-system\/rules\/[^/]+$/,
        method: 'PUT',
        config: createTaxConfig('tax rule')[1],
    },
    {
        pattern: /\/api\/v1\/tax-system\/rules\/[^/]+$/,
        method: 'DELETE',
        config: createTaxConfig('tax rule')[2],
    },
    {
        pattern: /\/api\/v1\/tax-system\/tourist-taxes$/,
        method: 'POST',
        config: createTaxConfig('tourist tax')[0],
    },
    {
        pattern: /\/api\/v1\/tax-system\/tourist-taxes\/[^/]+$/,
        method: 'PUT',
        config: createTaxConfig('tourist tax')[1],
    },
    {
        pattern: /\/api\/v1\/tax-system\/tourist-taxes\/[^/]+$/,
        method: 'DELETE',
        config: createTaxConfig('tourist tax')[2],
    },

    // ==================== LOYALTY ====================
    {
        pattern: /\/api\/v1\/loyalty\/config$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.LOYALTY_CONFIG,
            success =>
                success
                    ? 'Loyalty configuration created'
                    : 'Failed to create loyalty configuration',
            ['loyalty-management', 'loyalty-config-creation']
        ),
    },
    {
        pattern: /\/api\/v1\/loyalty\/guest$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.LOYALTY_GUEST,
            success =>
                success
                    ? 'Loyalty guest enrolled'
                    : 'Failed to enroll loyalty guest',
            ['loyalty-management', 'guest-enrollment']
        ),
    },
    {
        pattern: /\/api\/v1\/loyalty\/guest\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.LOYALTY_GUEST,
            success =>
                success
                    ? 'Loyalty guest updated'
                    : 'Failed to update loyalty guest',
            ['loyalty', 'guest', 'update']
        ),
    },
    {
        pattern: /\/api\/v1\/loyalty\/guest\/register$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.LOYALTY_GUEST,
            success =>
                success
                    ? 'Loyalty guest registered'
                    : 'Failed to register loyalty guest',
            ['loyalty', 'guest', 'register']
        ),
    },

    // Creation Loyalty
    {
        pattern: /\/api\/v1\/loyalty\/creation$/,
        method: 'POST',
        config: createLoyaltyConfig('creation-loyalty')[0],
    },
    {
        pattern: /\/api\/v1\/loyalty\/creation\/[^/]+$/,
        method: 'PATCH',
        config: createLoyaltyConfig('creation-loyalty')[1],
    },
    {
        pattern: /\/api\/v1\/loyalty\/creation\/[^/]+$/,
        method: 'DELETE',
        config: createLoyaltyConfig('creation-loyalty')[2],
    },

    // Loyalty Condition
    {
        pattern: /\/api\/v1\/loyalty\/condition$/,
        method: 'POST',
        config: createLoyaltyConfig('condition')[0],
    },
    {
        pattern: /\/api\/v1\/loyalty\/condition\/[^/]+$/,
        method: 'PATCH',
        config: createLoyaltyConfig('condition')[1],
    },
    {
        pattern: /\/api\/v1\/loyalty\/condition\/[^/]+$/,
        method: 'DELETE',
        config: createLoyaltyConfig('condition')[2],
    },
    {
        pattern: /\/api\/v1\/loyalty\/condition\/special$/,
        method: 'POST',
        config: createLoyaltyConfig('special-condition')[0],
    },
    {
        pattern: /\/api\/v1\/loyalty\/condition\/special\/[^/]+$/,
        method: 'PATCH',
        config: createLoyaltyConfig('special-condition')[1],
    },
    {
        pattern: /\/api\/v1\/loyalty\/condition\/special\/[^/]+$/,
        method: 'DELETE',
        config: createLoyaltyConfig('special-condition')[2],
    },

    // Loyalty Field
    {
        pattern: /\/api\/v1\/loyalty\/field$/,
        method: 'POST',
        config: createLoyaltyConfig('field')[0],
    },
    {
        pattern: /\/api\/v1\/loyalty\/field\/update-many\/[^/]+$/,
        method: 'PATCH',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.LOYALTY_CONFIG,
            success =>
                success
                    ? 'Multiple loyalty fields updated'
                    : 'Failed to update loyalty fields',
            ['loyalty', 'field', 'bulk-update']
        ),
    },
    {
        pattern: /\/api\/v1\/loyalty\/field\/[^/]+\/[^/]+$/,
        method: 'PATCH',
        config: createLoyaltyConfig('field')[1],
    },
    {
        pattern: /\/api\/v1\/loyalty\/field\/[^/]+\/[^/]+$/,
        method: 'DELETE',
        config: createLoyaltyConfig('field')[2],
    },

    // Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty\/program$/,
        method: 'POST',
        config: createLoyaltyConfig('program')[0],
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/[^/]+$/,
        method: 'GET',
        config: createSimpleConfig(
            ActivityAction.EXPORT,
            ActivityEntity.LOYALTY_CONFIG,
            success =>
                success
                    ? 'Loyalty program details retrieved'
                    : 'Failed to retrieve loyalty program',
            ['loyalty', 'program', 'export']
        ),
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/[^/]+$/,
        method: 'PATCH',
        config: createLoyaltyConfig('program')[1],
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/[^/]+$/,
        method: 'DELETE',
        config: createLoyaltyConfig('program')[2],
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/creation\/[^/]+$/,
        method: 'GET',
        config: createSimpleConfig(
            ActivityAction.EXPORT,
            ActivityEntity.LOYALTY_CONFIG,
            success =>
                success
                    ? 'Loyalty programs by creation retrieved'
                    : 'Failed to retrieve loyalty programs',
            ['loyalty', 'program', 'export', 'creation']
        ),
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/advance$/,
        method: 'POST',
        config: createLoyaltyConfig('advance-program')[0],
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/advance\/[^/]+$/,
        method: 'GET',
        config: createSimpleConfig(
            ActivityAction.EXPORT,
            ActivityEntity.LOYALTY_CONFIG,
            success =>
                success
                    ? 'Advance loyalty program details retrieved'
                    : 'Failed to retrieve advance loyalty program',
            ['loyalty', 'advance-program', 'export']
        ),
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/advance\/update\/[^/]+$/,
        method: 'PATCH',
        config: createLoyaltyConfig('advance-program')[1],
    },
    {
        pattern: /\/api\/v1\/loyalty\/program\/advance\/delete\/[^/]+$/,
        method: 'DELETE',
        config: createLoyaltyConfig('advance-program')[2],
    },

    // Property Loyalty
    {
        pattern: /\/api\/v1\/loyalty\/property$/,
        method: 'POST',
        config: createLoyaltyConfig('property-loyalty')[0],
    },
    {
        pattern: /\/api\/v1\/loyalty\/property\/config\/[^/]+$/,
        method: 'PATCH',
        config: createLoyaltyConfig('property-loyalty')[1],
    },
    {
        pattern: /\/api\/v1\/loyalty\/property\/config\/[^/]+$/,
        method: 'DELETE',
        config: createLoyaltyConfig('property-loyalty')[2],
    },

    // ==================== PROMO CODE ====================
    {
        pattern: /\/api\/v1\/promo-code$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.PROMO_CODE, 'code')[0],
    },
    {
        pattern: /\/api\/v1\/promo-code\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.PROMO_CODE, 'code')[1],
    },
    {
        pattern: /\/api\/v1\/promo-code\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.PROMO_CODE, 'code')[2],
    },
    {
        pattern: /\/api\/v1\/promo-code\/recover\/[^/]+\/[^/]+$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.PROMO_CODE,
            success =>
                success
                    ? 'Promo code recovered'
                    : 'Failed to recover promo code',
            ['promo-code', 'recover']
        ),
    },

    // ==================== POLICY ====================
    {
        pattern: /\/api\/v1\/policy$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.POLICY, 'name')[0],
    },
    {
        pattern: /\/api\/v1\/policy\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.POLICY, 'name')[1],
    },
    {
        pattern: /\/api\/v1\/policy\/[^/]+$/,
        method: 'DELETE',
        config: createCRUDConfig(ActivityEntity.POLICY, 'name')[2],
    },
    {
        pattern: /\/api\/v1\/policy\/addToRatePlan$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.POLICY,
            success =>
                success
                    ? 'Policy added to rate plan'
                    : 'Failed to add policy to rate plan',
            ['policy', 'rate-plan', 'mapping']
        ),
    },

    // ==================== PROMOTIONS ====================
    // Customizable Deal
    {
        pattern: /\/api\/v1\/promotions\/customizable-deal$/,
        method: 'POST',
        config: createPromotionConfig('customizable-deal')[0],
    },
    {
        pattern: /\/api\/v1\/promotions\/customizable-deal\/[^/]+$/,
        method: 'PUT',
        config: createPromotionConfig('customizable-deal')[1],
    },
    {
        pattern: /\/api\/v1\/promotions\/customizable-deal\/[^/]+$/,
        method: 'DELETE',
        config: createPromotionConfig('customizable-deal')[2],
    },

    // Device Specific
    {
        pattern: /\/api\/v1\/promotions\/device-specific$/,
        method: 'POST',
        config: createPromotionConfig('device-specific')[0],
    },
    {
        pattern: /\/api\/v1\/promotions\/device-specific\/[^/]+$/,
        method: 'PUT',
        config: createPromotionConfig('device-specific')[1],
    },
    {
        pattern: /\/api\/v1\/promotions\/device-specific\/[^/]+$/,
        method: 'DELETE',
        config: createPromotionConfig('device-specific')[2],
    },
    {
        pattern:
            /\/api\/v1\/promotions\/device-specific\/[^/]+\/toggle-status$/,
        method: 'PATCH',
        config: createToggleStatusConfig(
            ActivityEntity.PROMOTION,
            'device-specific promotion'
        ),
    },

    // Early Bird
    {
        pattern: /\/api\/v1\/promotions\/early-bird$/,
        method: 'POST',
        config: createPromotionConfig('early-bird')[0],
    },
    {
        pattern: /\/api\/v1\/promotions\/early-bird\/[^/]+$/,
        method: 'PUT',
        config: createPromotionConfig('early-bird')[1],
    },
    {
        pattern: /\/api\/v1\/promotions\/early-bird\/[^/]+$/,
        method: 'DELETE',
        config: createPromotionConfig('early-bird')[2],
    },
    {
        pattern: /\/api\/v1\/promotions\/early-bird\/[^/]+\/toggle-status$/,
        method: 'PATCH',
        config: createToggleStatusConfig(
            ActivityEntity.PROMOTION,
            'early-bird promotion'
        ),
    },

    // Offer for Tonight
    {
        pattern: /\/api\/v1\/promotions\/offer-for-tonight$/,
        method: 'POST',
        config: createPromotionConfig('offer-for-tonight')[0],
    },
    {
        pattern: /\/api\/v1\/promotions\/offer-for-tonight\/[^/]+$/,
        method: 'PUT',
        config: createPromotionConfig('offer-for-tonight')[1],
    },
    {
        pattern: /\/api\/v1\/promotions\/offer-for-tonight\/[^/]+$/,
        method: 'DELETE',
        config: createPromotionConfig('offer-for-tonight')[2],
    },
    {
        pattern:
            /\/api\/v1\/promotions\/offer-for-tonight\/[^/]+\/toggle-status$/,
        method: 'PATCH',
        config: createToggleStatusConfig(
            ActivityEntity.PROMOTION,
            'offer-for-tonight promotion'
        ),
    },

    // Geo Rate Plan
    {
        pattern: /\/api\/v1\/promotions\/geo-rate-plan$/,
        method: 'POST',
        config: createPromotionConfig('geo-rate-plan')[0],
    },
    {
        pattern: /\/api\/v1\/promotions\/geo-rate-plan\/[^/]+$/,
        method: 'PUT',
        config: createPromotionConfig('geo-rate-plan')[1],
    },
    {
        pattern: /\/api\/v1\/promotions\/geo-rate-plan\/[^/]+$/,
        method: 'DELETE',
        config: createPromotionConfig('geo-rate-plan')[2],
    },

    // MLOS
    {
        pattern: /\/api\/v1\/promotions\/mlos$/,
        method: 'POST',
        config: createPromotionConfig('mlos')[0],
    },
    {
        pattern: /\/api\/v1\/promotions\/mlos\/[^/]+$/,
        method: 'PUT',
        config: createPromotionConfig('mlos')[1],
    },
    {
        pattern: /\/api\/v1\/promotions\/mlos\/[^/]+$/,
        method: 'DELETE',
        config: createPromotionConfig('mlos')[2],
    },

    // ==================== BOOKING ENGINE ====================
    {
        pattern: /\/api\/v1\/booking-engine\/[^/]+$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Booking engine configuration created'
                    : 'Failed to create booking engine',
            ['booking-engine', 'create']
        ),
    },
    {
        pattern: /\/api\/v1\/booking-engine\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Booking engine configuration updated'
                    : 'Failed to update booking engine',
            ['booking-engine', 'update']
        ),
    },
    {
        pattern: /\/api\/v1\/booking-engine\/[^/]+$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.DELETE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Booking engine configuration deleted'
                    : 'Failed to delete booking engine',
            ['booking-engine', 'delete']
        ),
    },

    // ==================== MANAGEMENT ====================
    // Category
    {
        pattern: /\/api\/v1\/management\/category\/create$/,
        method: 'POST',
        config: createManagementConfig('category', ActivityAction.CREATE),
    },
    {
        pattern: /\/api\/v1\/management\/category\/delete\/[^/]+$/,
        method: 'DELETE',
        config: createManagementConfig('category', ActivityAction.DELETE),
    },

    // Type
    {
        pattern: /\/api\/v1\/management\/type\/create$/,
        method: 'POST',
        config: createManagementConfig('type', ActivityAction.CREATE),
    },
    {
        pattern: /\/api\/v1\/management\/type\/delete\/[^/]+$/,
        method: 'DELETE',
        config: createManagementConfig('type', ActivityAction.DELETE),
    },

    // Amenity
    {
        pattern: /\/api\/v1\/management\/amenity\/create$/,
        method: 'POST',
        config: createManagementConfig('amenity', ActivityAction.CREATE),
    },
    {
        pattern: /\/api\/v1\/management\/amenity\/update$/,
        method: 'PUT',
        config: createManagementConfig('amenity', ActivityAction.UPDATE),
    },

    // Room Amenity
    {
        pattern: /\/api\/v1\/management\/amenity\/room\/create$/,
        method: 'POST',
        config: createManagementConfig('room amenity', ActivityAction.CREATE),
    },
    {
        pattern: /\/api\/v1\/management\/amenity\/room\/update$/,
        method: 'PUT',
        config: createManagementConfig('room amenity', ActivityAction.UPDATE),
    },

    // Loyalty Guest Field
    {
        pattern: /\/api\/v1\/management\/loyalty-guest-field$/,
        method: 'POST',
        config: createManagementConfig(
            'loyalty guest field',
            ActivityAction.CREATE
        ),
    },
    {
        pattern: /\/api\/v1\/management\/loyalty-guest-field\/[^/]+$/,
        method: 'PUT',
        config: createManagementConfig(
            'loyalty guest field',
            ActivityAction.UPDATE
        ),
    },

    // ==================== CREATION ====================
    {
        pattern: /\/api\/v1\/create$/,
        method: 'POST',
        config: createCRUDConfig(ActivityEntity.CREATION, 'name')[0],
    },
    {
        pattern: /\/api\/v1\/create\/[^/]+$/,
        method: 'PUT',
        config: createCRUDConfig(ActivityEntity.CREATION, 'name')[1],
    },
    {
        pattern: /\/api\/v1\/create\/toggleDraft\/[^/]+$/,
        method: 'PUT',
        config: createToggleStatusConfig(
            ActivityEntity.CREATION,
            'creation draft'
        ),
    },

    // ==================== BOOKING OFFSET ====================
    {
        pattern: /\/api\/v1\/ari\/booking-offset\/[^/]+$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Booking offset created successfully'
                    : 'Failed to create booking offset',
            ['booking-offset', 'ari', 'create']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/booking-offset\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Booking offset updated successfully'
                    : 'Failed to update booking offset',
            ['booking-offset', 'ari', 'update']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/booking-offset\/[^/]+$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.DELETE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Booking offset deleted successfully'
                    : 'Failed to delete booking offset',
            ['booking-offset', 'ari', 'delete']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/booking-offset\/[^/]+$/,
        method: 'PATCH',
        config: {
            ...createSimpleConfig(
                ActivityAction.UPDATE,
                ActivityEntity.INVENTORY,
                success =>
                    success
                        ? 'Booking offset upserted successfully'
                        : 'Failed to upsert booking offset',
                ['booking-offset', 'ari', 'upsert']
            ),
            shouldLog: logOnlySuccess,
        },
    },
    {
        pattern: /\/api\/v1\/ari\/booking-offset\/single\/[^/]+$/,
        method: 'PUT',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Booking offset record updated'
                    : 'Failed to update booking offset record',
            ['booking-offset', 'ari', 'update-single']
        ),
    },
    {
        pattern: /\/api\/v1\/ari\/booking-offset\/single\/[^/]+$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.DELETE,
            ActivityEntity.INVENTORY,
            success =>
                success
                    ? 'Booking offset record deleted'
                    : 'Failed to delete booking offset record',
            ['booking-offset', 'ari', 'delete-single']
        ),
    },

    // ==================== PROPERTY INTEGRATION ====================
    {
        pattern: /\/api\/v1\/property-management\/property\/integration$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Property integration created successfully'
                    : 'Failed to create property integration',
            ['property', 'integration', 'create']
        ),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/integration\/[^/]+$/,
        method: 'PATCH',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Property integration status updated'
                    : 'Failed to update property integration status',
            ['property', 'integration', 'status', 'update']
        ),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/integration\/[^/]+$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.DELETE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Property integration deleted'
                    : 'Failed to delete property integration',
            ['property', 'integration', 'delete']
        ),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/integration\/field\/[^/]+$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.CREATE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Integration field added successfully'
                    : 'Failed to add integration field',
            ['property', 'integration', 'field', 'create']
        ),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/integration\/field\/[^/]+$/,
        method: 'PATCH',
        config: createSimpleConfig(
            ActivityAction.UPDATE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Integration field updated successfully'
                    : 'Failed to update integration field',
            ['property', 'integration', 'field', 'update']
        ),
    },
    {
        pattern:
            /\/api\/v1\/property-management\/property\/integration\/field\/[^/]+$/,
        method: 'DELETE',
        config: createSimpleConfig(
            ActivityAction.DELETE,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'Integration field deleted successfully'
                    : 'Failed to delete integration field',
            ['property', 'integration', 'field', 'delete']
        ),
    },

    // ==================== INTEGRATIONS - RATE TIGER ====================
    {
        pattern: /\/api\/v1\/integrations\/rate-tiger\/authenticate$/,
        method: 'POST',
        config: createSimpleConfig(
            ActivityAction.LOGIN,
            ActivityEntity.PROPERTY,
            success =>
                success
                    ? 'RateTiger authentication successful'
                    : 'RateTiger authentication failed',
            ['integration', 'rate-tiger', 'authentication']
        ),
    },
    {
        pattern: /\/api\/v1\/integrations\/rate-tiger\/ari$/,
        method: 'POST',
        config: {
            ...createSimpleConfig(
                ActivityAction.UPDATE,
                ActivityEntity.INVENTORY,
                success =>
                    success
                        ? 'RateTiger ARI update processed successfully'
                        : 'Failed to process RateTiger ARI update',
                ['integration', 'rate-tiger', 'ari', 'update']
            ),
            shouldLog: logOnlySuccess,
        },
    }, // In your ACTIVITY_LOGGER_ROUTES, replace the SiteMinder config with this:

{
    pattern: /\/api\/v1\/integrations\/site-minder\/ari$/,
    method: 'POST',
    config: {
        action: ActivityAction.UPDATE,
        entity: ActivityEntity.INVENTORY,
        getEntityId: (req, resBody) => {
            // Extract HotelCode from XML
            if (typeof req.body === 'string') {
                const match = req.body.match(/HotelCode="([^"]+)"/);
                return match ? match[1] : 'unknown';
            }
            return resBody?.data?.propertyId || 'unknown';
        },
        getEntityName: (req, resBody) => {
            // Extract room type from XML
            if (typeof req.body === 'string') {
                const match = req.body.match(/InvTypeCode="([^"]+)"/);
                return match ? match[1] : 'unknown';
            }
            return 'unknown';
        },
        getDescription: (req, resBody, statusCode) => {
            const isSuccess = statusCode! >= 200 && statusCode! < 300;
            if (!isSuccess) return 'SiteMinder ARI update failed';
            
            if (typeof req.body === 'string') {
                const hotelCode = req.body.match(/HotelCode="([^"]+)"/)?.[1];
                const roomType = req.body.match(/InvTypeCode="([^"]+)"/)?.[1];
                const action = req.body.includes('Status="Close"') ? 'closed' : 'updated';
                
                return `SiteMinder ${action} inventory for ${hotelCode || 'hotel'}${roomType ? ` - ${roomType}` : ''}`;
            }
            return 'SiteMinder ARI update processed';
        },
        tags: ['integration', 'site-minder', 'ari', 'xml'],
        shouldLog: logOnlySuccess,
    }
}
];

export const ALL_ACTIVITY_LOGGER_ROUTES = ACTIVITY_LOGGER_ROUTES;
