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
    logOnlySuccess,
} from './activityLoggerHelpers';

interface RoutePattern {
    pattern: RegExp;
    method?: string | string[];
    config: IActivityConfig;
}

export const SIMPLIFIED_ACTIVITY_LOGGER_ROUTES: RoutePattern[] = [
    // AUTH - Custom logic
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

    // RESERVATION CRUD
    {
        pattern: /\/api\/v1\/booking-engine\/reservation$/,
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
        pattern: /\/api\/v1\/booking-engine\/reservation\/[^/]+$/,
        method: ['PUT', 'PATCH'],
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RESERVATION,
            getEntityId: req =>
                req.params?.reservationId || req.params?.id || 'unknown',
            getEntityName: (req, resBody) => resBody?.data?.reservationCode,
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                return isSuccess
                    ? `Reservation updated successfully`
                    : `Failed to update reservation`;
            },
            tags: ['booking', 'reservation-update'],
        },
    },

    {
        pattern: /\/api\/v1\/booking-engine\/reservation\/[^/]+\/cancel$/,
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
        pattern: /\/api\/v1\/booking-engine\/reservation\/[^/]+\/checkin$/,
        method: 'POST',
        config: createCheckInOutConfig(ActivityAction.CHECKIN),
    },

    {
        pattern: /\/api\/v1\/booking-engine\/reservation\/[^/]+\/checkout$/,
        method: 'POST',
        config: createCheckInOutConfig(ActivityAction.CHECKOUT),
    },

    {
        pattern: /\/api\/v1\/booking-engine\/payment$/,
        method: 'POST',
        config: createPaymentConfig(ActivityEntity.PAYMENT),
    },

    {
        pattern: /\/api\/v1\/booking-engine\/reservation\/[^/]+\/cancel$/,
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
            shouldLog: logOnlySuccess, // Only log successful updates
        },
    },

    // TAX_RULE
    {
        pattern: /\/api\/v1\/tax-system\/tax-rule$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.TAX_RULE,
            getEntityId: (req, resBody) => resBody?.data?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || req.body?.name,
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                return isSuccess
                    ? `Tax rule created successfully`
                    : `Failed to create tax rule`;
            },
            tags: ['tax-management', 'tax-rule-creation'],
        },
    },

    // LOYALTY
    {
        pattern: /\/api\/v1\/loyalty\/config$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) => resBody?.data?.id || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                return isSuccess
                    ? `Loyalty configuration created successfully`
                    : `Failed to create loyalty configuration`;
            },
            tags: ['loyalty-management', 'loyalty-config-creation'],
        },
    },

    {
        pattern: /\/api\/v1\/loyalty\/guest$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_GUEST,
            getEntityId: (req, resBody) => resBody?.data?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email || req.body?.email,
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                return isSuccess
                    ? `Loyalty guest enrolled successfully`
                    : `Failed to enroll loyalty guest`;
            },
            tags: ['loyalty-management', 'guest-enrollment'],
        },
    },

    // ACCESS CONTROL
    {
        pattern: /\/api\/v1\/access-control\/createNewRole$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.ACCESS_CONTROL,
            getEntityId: (req, resBody) =>
                resBody?.data?.roleId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roleName ||
                req.body?.roleName ||
                req.body?.role ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roleName =
                    resBody?.data?.roleName ||
                    req.body?.roleName ||
                    req.body?.role ||
                    'unknown';
                return isSuccess
                    ? `New role '${roleName}' created successfully`
                    : `Failed to create role '${roleName}'`;
            },
            tags: ['access-control', 'role-management', 'create', 'security'],
        },
    },
    {
        pattern: /\/api\/v1\/access-control\/modify\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.ACCESS_CONTROL,
            getEntityId: (req, resBody) =>
                req.params?.role || resBody?.data?.roleId || 'unknown',
            getEntityName: (req, resBody) =>
                req.params?.role || resBody?.data?.roleName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roleName = req.params?.role || 'unknown';
                const permissionsCount = req.body?.permissions
                    ? Object.keys(req.body.permissions).length
                    : 0;
                return isSuccess
                    ? `Access permissions updated for role '${roleName}'${permissionsCount > 0 ? ` (${permissionsCount} permissions modified)` : ''}`
                    : `Failed to update access for role '${roleName}'`;
            },
            tags: [
                'access-control',
                'role-management',
                'update',
                'permissions',
                'security',
            ],
        },
    },
    {
        pattern: /\/api\/v1\/access-control\/delete\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.ACCESS_CONTROL,
            getEntityId: (req, resBody) => req.params?.role || 'unknown',
            getEntityName: (req, resBody) =>
                req.params?.role || resBody?.data?.roleName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roleName = req.params?.role || 'unknown';
                return isSuccess
                    ? `Role '${roleName}' deleted successfully`
                    : `Failed to delete role '${roleName}'`;
            },
            tags: ['access-control', 'role-management', 'delete', 'security'],
        },
    },

    // ADDON CRUD routes are auto-generated below
    // ADDON_AVAILABILITY (addon-datewise) routes - custom logic required
    {
        pattern: /\/api\/v1\/addon-datewise$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.ADDON_AVAILABILITY,
            getEntityId: (req, resBody) =>
                resBody?.data?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.addonName || req.body?.addonName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const addonName =
                    resBody?.data?.addonName ||
                    req.body?.addonName ||
                    'unknown';
                const date = resBody?.data?.date || req.body?.date || '';
                return isSuccess
                    ? `Addon availability '${addonName}' created for date ${date}`
                    : `Failed to create addon availability for '${addonName}'`;
            },
            tags: ['addon', 'addon-availability', 'create', 'datewise'],
        },
    },

    // Update Addon by Addon ID
    {
        pattern: /\/api\/v1\/addon-datewise\/addon\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.ADDON_AVAILABILITY,
            getEntityId: (req, resBody) =>
                req.params?.addonId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.addonName || req.body?.addonName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const addonName =
                    resBody?.data?.addonName || req.body?.addonName || 'addon';
                return isSuccess
                    ? `Addon availability updated for '${addonName}'`
                    : `Failed to update addon availability for '${addonName}'`;
            },
            tags: ['addon', 'addon-availability', 'update', 'datewise'],
        },
    },

    // Update Addon for Single Date
    {
        pattern: /\/api\/v1\/addon-datewise\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.ADDON_AVAILABILITY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.addonName || req.body?.addonName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const date =
                    resBody?.data?.date || req.body?.date || 'specific date';
                return isSuccess
                    ? `Addon availability updated for ${date}`
                    : `Failed to update addon availability for ${date}`;
            },
            tags: ['addon', 'addon-availability', 'update', 'single-date'],
        },
    },

    // Delete Addon by Addon ID
    {
        pattern: /\/api\/v1\/addon-datewise\/addon\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.ADDON_AVAILABILITY,
            getEntityId: (req, resBody) => req.params?.addonId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.addonName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const addonName = resBody?.data?.addonName || 'addon';
                return isSuccess
                    ? `Addon availability deleted for '${addonName}'`
                    : `Failed to delete addon availability`;
            },
            tags: ['addon', 'addon-availability', 'delete', 'datewise'],
        },
    },

    // Delete Addon for Particular Date
    {
        pattern: /\/api\/v1\/addon-datewise\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.ADDON_AVAILABILITY,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.addonName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const date = resBody?.data?.date || 'specific date';
                return isSuccess
                    ? `Addon availability deleted for ${date}`
                    : `Failed to delete addon availability for ${date}`;
            },
            tags: ['addon', 'addon-availability', 'delete', 'single-date'],
        },
    },

    // AGENCY CRUD routes are auto-generated below
    // AGENT routes - custom logic required
    // Agent Login
    {
        pattern: /\/api\/v1\/agent\/login$/,
        method: 'POST',
        config: {
            action: ActivityAction.LOGIN,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) =>
                resBody?.data?.agentId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email || req.body?.email || 'unknown',
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

    // Create Agent
    {
        pattern: /\/api\/v1\/agent$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) =>
                resBody?.data?.agentId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email ||
                req.body?.email ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const agentName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.email ||
                    req.body?.email ||
                    'unknown';
                return isSuccess
                    ? `Agent '${agentName}' created successfully`
                    : `Failed to create agent '${agentName}'`;
            },
            tags: ['agent', 'create', 'agent-management'],
        },
    },

    // Update Agent
    {
        pattern: /\/api\/v1\/agent\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email ||
                req.body?.email ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const agentName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.email ||
                    req.body?.email ||
                    'unknown';
                return isSuccess
                    ? `Agent '${agentName}' updated successfully`
                    : `Failed to update agent '${agentName}'`;
            },
            tags: ['agent', 'update', 'agent-management'],
        },
    },

    // Delete Agent
    {
        pattern: /\/api\/v1\/agent\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email || resBody?.data?.name || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const agentName =
                    resBody?.data?.name ||
                    resBody?.data?.email ||
                    'deleted agent';
                return isSuccess
                    ? `Agent '${agentName}' deleted successfully`
                    : `Failed to delete agent`;
            },
            tags: ['agent', 'delete', 'agent-management'],
        },
    },
    // Agent Login
    {
        pattern: /\/api\/v1\/agent-auth\/login$/,
        method: 'POST',
        config: {
            action: ActivityAction.LOGIN,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) =>
                resBody?.data?.agentId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email || req.body?.email || 'unknown',
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

    // Agent Logout
    {
        pattern: /\/api\/v1\/agent-auth\/logout$/,
        method: 'POST',
        config: {
            action: ActivityAction.LOGOUT,
            entity: ActivityEntity.AGENT,
            getEntityId: (req, resBody) =>
                (req as AgentRequest).agent?.id || 'unknown',
            getEntityName: (req, resBody) =>
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
    // Get Calendar Availability
    {
        pattern: /\/api\/v1\/availability\/calendar$/,
        method: 'POST',
        config: {
            action: ActivityAction.EXPORT,
            entity: ActivityEntity.INVENTORY,
            getEntityId: (req, resBody) => req.body?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'unknown';
                const startDate = req.body?.startDate || '';
                const endDate = req.body?.endDate || '';
                const dateRange =
                    startDate && endDate
                        ? ` for ${startDate} to ${endDate}`
                        : '';
                return isSuccess
                    ? `Calendar availability retrieved for property '${propertyName}'${dateRange}`
                    : `Failed to retrieve calendar availability for property '${propertyName}'`;
            },
            tags: ['availability', 'calendar', 'inventory', 'export'],
        },
    },
    // Create New Inventory
    {
        pattern: /\/api\/v1\/inventory\/create\/[^/]+$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.INVENTORY,
            getEntityId: (req, resBody) =>
                resBody?.data?.inventoryId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomTypeName ||
                req.body?.roomTypeName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomTypeName =
                    resBody?.data?.roomTypeName ||
                    req.body?.roomTypeName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                return isSuccess
                    ? `Inventory created for room type '${roomTypeName}'${propertyName ? ` at property '${propertyName}'` : ''}`
                    : `Failed to create inventory for room type '${roomTypeName}'`;
            },
            tags: ['inventory', 'create', 'ari'],
        },
    },

    // Map Rate Plans to Inventory
    {
        pattern: /\/api\/v1\/inventory\/map\/rateplan\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.INVENTORY,
            getEntityId: (req, resBody) => req.params?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const ratePlanCount =
                    req.body?.ratePlans?.length ||
                    req.body?.ratePlanIds?.length ||
                    0;
                return isSuccess
                    ? `Rate plans mapped to inventory for '${propertyName}'${ratePlanCount > 0 ? ` (${ratePlanCount} rate plans)` : ''}`
                    : `Failed to map rate plans to inventory for '${propertyName}'`;
            },
            tags: ['inventory', 'rate-plan', 'mapping', 'update'],
        },
    },

    // Update Rate Plan Price
    {
        pattern: /\/api\/v1\/inventory\/update\/price$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.body?.ratePlanId || resBody?.data?.ratePlanId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.ratePlanName ||
                req.body?.ratePlanName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.ratePlanName ||
                    req.body?.ratePlanName ||
                    'rate plan';
                const newPrice = req.body?.price || req.body?.newPrice || '';
                return isSuccess
                    ? `Rate plan price updated for '${ratePlanName}'${newPrice ? ` to ${newPrice}` : ''}`
                    : `Failed to update price for rate plan '${ratePlanName}'`;
            },
            tags: ['rate-plan', 'price', 'update', 'ari'],
            shouldLog: logOnlySuccess,
        },
    },

    // Update or Create Rate Plan Charges
    {
        pattern: /\/api\/v1\/inventory\/update-or-create\/charges$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.CHARGE,
            getEntityId: (req, resBody) =>
                resBody?.data?.chargeId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.chargeName || req.body?.chargeName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyCode = req.body?.propertyCode || '';
                const chargeCount = req.body?.charges?.length || 0;
                return isSuccess
                    ? `Rate plan charges updated${propertyCode ? ` for property ${propertyCode}` : ''}${chargeCount > 0 ? ` (${chargeCount} charges)` : ''}`
                    : `Failed to update rate plan charges`;
            },
            tags: ['rate-plan', 'charges', 'update', 'ari'],
            shouldLog: logOnlySuccess,
        },
    }, // Create Rate Plan
    {
        pattern: /\/api\/v1\/rateplan$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                resBody?.data?.ratePlanId ||
                resBody?.data?._id ||
                resBody?.data?.ratePlanCode ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.ratePlanName ||
                req.body?.ratePlanName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.ratePlanName ||
                    req.body?.ratePlanName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                return isSuccess
                    ? `Rate plan '${ratePlanName}' created${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create rate plan '${ratePlanName}'`;
            },
            tags: ['rate-plan', 'create', 'pricing'],
        },
    },

    // Update Rate Plan
    {
        pattern: /\/api\/v1\/rateplan\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.params?.ratePlanCode || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.ratePlanName ||
                req.body?.ratePlanName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.ratePlanName ||
                    req.body?.ratePlanName ||
                    req.params?.ratePlanCode ||
                    'unknown';
                return isSuccess
                    ? `Rate plan '${ratePlanName}' updated successfully`
                    : `Failed to update rate plan '${ratePlanName}'`;
            },
            tags: ['rate-plan', 'update', 'pricing'],
        },
    },

    // Delete Rate Plan
    {
        pattern: /\/api\/v1\/rateplan\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.params?.ratePlanCode || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.ratePlanName ||
                req.params?.ratePlanCode ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.name ||
                    resBody?.data?.ratePlanName ||
                    req.params?.ratePlanCode ||
                    'deleted rate plan';
                return isSuccess
                    ? `Rate plan '${ratePlanName}' deleted successfully`
                    : `Failed to delete rate plan`;
            },
            tags: ['rate-plan', 'delete', 'pricing'],
        },
    },

    // Add Tax Group to Rate Plan
    {
        pattern: /\/api\/v1\/rateplan\/add\/tax$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.body?.ratePlanId || req.body?.ratePlanCode || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.ratePlanName ||
                req.body?.ratePlanName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.ratePlanName ||
                    req.body?.ratePlanName ||
                    'rate plan';
                const taxGroupName =
                    req.body?.taxGroupName || req.body?.taxGroupId || '';
                return isSuccess
                    ? `Tax group${taxGroupName ? ` '${taxGroupName}'` : ''} added to rate plan '${ratePlanName}'`
                    : `Failed to add tax group to rate plan '${ratePlanName}'`;
            },
            tags: ['rate-plan', 'tax', 'update', 'pricing'],
        },
    },

    // Remove Tax Group from Rate Plan
    {
        pattern: /\/api\/v1\/rateplan\/remove\/tax$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.body?.ratePlanId || req.body?.ratePlanCode || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.ratePlanName ||
                req.body?.ratePlanName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.ratePlanName ||
                    req.body?.ratePlanName ||
                    'rate plan';
                const taxGroupName =
                    req.body?.taxGroupName || req.body?.taxGroupId || '';
                return isSuccess
                    ? `Tax group${taxGroupName ? ` '${taxGroupName}'` : ''} removed from rate plan '${ratePlanName}'`
                    : `Failed to remove tax group from rate plan '${ratePlanName}'`;
            },
            tags: ['rate-plan', 'tax', 'update', 'pricing'],
        },
    },
    // Apply Restrictions (CTA/CTD)
    {
        pattern: /\/api\/v1\/restriction\/apply$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN_RULE,
            getEntityId: (req, resBody) =>
                req.body?.propertyCode ||
                resBody?.data?.propertyCode ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                req.body?.propertyCode ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    req.body?.propertyCode ||
                    'property';
                const restrictionType = req.body?.restrictionType || '';
                const dateRange =
                    req.body?.startDate && req.body?.endDate
                        ? ` for ${req.body.startDate} to ${req.body.endDate}`
                        : '';
                return isSuccess
                    ? `Restrictions${restrictionType ? ` (${restrictionType})` : ''} applied to '${propertyName}'${dateRange}`
                    : `Failed to apply restrictions to '${propertyName}'`;
            },
            tags: ['restriction', 'rate-plan-rule', 'update', 'cta', 'ctd'],
            shouldLog: logOnlySuccess,
        },
    },
    // Add Addon to Rate Plan
    {
        pattern: /\/api\/v1\/rateplan-addon$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.body?.ratePlanId || req.body?.ratePlanCode || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.ratePlanName ||
                req.body?.ratePlanName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.ratePlanName ||
                    req.body?.ratePlanName ||
                    'rate plan';
                const addonName =
                    req.body?.addonName || req.body?.addonId || '';
                return isSuccess
                    ? `Addon${addonName ? ` '${addonName}'` : ''} added to rate plan '${ratePlanName}'`
                    : `Failed to add addon to rate plan '${ratePlanName}'`;
            },
            tags: ['rate-plan', 'addon', 'update', 'mapping'],
        },
    },

    // Remove Addon from Rate Plan
    {
        pattern: /\/api\/v1\/rateplan-addon$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.body?.ratePlanId || req.body?.ratePlanCode || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.ratePlanName ||
                req.body?.ratePlanName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ratePlanName =
                    resBody?.data?.ratePlanName ||
                    req.body?.ratePlanName ||
                    'rate plan';
                const addonName =
                    req.body?.addonName || req.body?.addonId || '';
                return isSuccess
                    ? `Addon${addonName ? ` '${addonName}'` : ''} removed from rate plan '${ratePlanName}'`
                    : `Failed to remove addon from rate plan '${ratePlanName}'`;
            },
            tags: ['rate-plan', 'addon', 'update', 'mapping'],
        },
    },
    // Get Room Rent Price
    {
        pattern: /\/api\/v1\/room-rent\/get-price$/,
        method: 'POST',
        config: {
            action: ActivityAction.EXPORT,
            entity: ActivityEntity.RATE_PLAN,
            getEntityId: (req, resBody) => req.body?.propertyCode || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                req.body?.propertyCode ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    req.body?.propertyCode ||
                    'property';
                const checkIn =
                    req.body?.checkIn || req.body?.checkInDate || '';
                const checkOut =
                    req.body?.checkOut || req.body?.checkOutDate || '';
                const dateRange =
                    checkIn && checkOut ? ` for ${checkIn} to ${checkOut}` : '';
                return isSuccess
                    ? `Room rent price calculated for '${propertyName}'${dateRange}`
                    : `Failed to calculate room rent price for '${propertyName}'`;
            },
            tags: ['room-rent', 'pricing', 'calculation', 'export'],
        },
    },
    // Create/Update Start Stop Sell
    {
        pattern: /\/api\/v1\/start-stop-sell\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.INVENTORY,
            getEntityId: (req, resBody) => req.params?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const action =
                    req.body?.isSellable === false ||
                    req.body?.action === 'stop'
                        ? 'stopped'
                        : 'started';
                const dateRange =
                    req.body?.startDate && req.body?.endDate
                        ? ` for ${req.body.startDate} to ${req.body.endDate}`
                        : '';
                return isSuccess
                    ? `Sell ${action} for '${propertyName}'${dateRange}`
                    : `Failed to update sell status for '${propertyName}'`;
            },
            tags: ['start-stop-sell', 'inventory', 'update', 'ari'],
            shouldLog: logOnlySuccess,
        },
    },
    // Create Creation
    {
        pattern: /\/api\/v1\/creation$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.CREATION,
            getEntityId: (req, resBody) =>
                resBody?.data?.creationId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const creationName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'unknown';
                return isSuccess
                    ? `Creation '${creationName}' created successfully`
                    : `Failed to create creation '${creationName}'`;
            },
            tags: ['creation', 'create', 'onboarding'],
        },
    },

    // Update Creation
    {
        pattern: /\/api\/v1\/creation\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.CREATION,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const creationName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'unknown';
                return isSuccess
                    ? `Creation '${creationName}' updated successfully`
                    : `Failed to update creation '${creationName}'`;
            },
            tags: ['creation', 'update', 'onboarding'],
        },
    },

    // Toggle Draft Status
    {
        pattern: /\/api\/v1\/creation\/toggleDraft\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.CREATION,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.propertyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const creationName =
                    resBody?.data?.name ||
                    resBody?.data?.propertyName ||
                    'creation';
                const isDraft = resBody?.data?.isDraft ?? req.body?.isDraft;
                const status =
                    isDraft === false
                        ? 'published'
                        : isDraft === true
                          ? 'drafted'
                          : 'toggled';
                return isSuccess
                    ? `Creation '${creationName}' ${status} successfully`
                    : `Failed to toggle draft status for creation '${creationName}'`;
            },
            tags: ['creation', 'draft', 'update', 'status'],
        },
    },
    // Forgot Password
    {
        pattern: /\/api\/v1\/user\/forgot-password$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.USER,
            getEntityId: (req, resBody) => 'password-reset-request',
            getEntityName: (req, resBody) => req.body?.email || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const email = req.body?.email || 'unknown';
                return isSuccess
                    ? `Password reset requested for ${email}`
                    : `Failed password reset request for ${email}`;
            },
            tags: ['user', 'password-reset', 'security', 'authentication'],
        },
    },

    // Verify Reset OTP
    {
        pattern: /\/api\/v1\/user\/verify-reset-otp$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.USER,
            getEntityId: (req, resBody) => 'otp-verification',
            getEntityName: (req, resBody) => req.body?.email || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const email = req.body?.email || 'unknown';
                return isSuccess
                    ? `Reset OTP verified for ${email}`
                    : `Failed OTP verification for ${email}`;
            },
            tags: ['user', 'otp', 'verification', 'security'],
        },
    },

    // Reset Password
    {
        pattern: /\/api\/v1\/user\/reset-password$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.USER,
            getEntityId: (req, resBody) =>
                resBody?.data?.userId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                req.body?.email || resBody?.data?.email || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const email =
                    req.body?.email || resBody?.data?.email || 'unknown';
                return isSuccess
                    ? `Password reset successfully for ${email}`
                    : `Failed to reset password for ${email}`;
            },
            tags: ['user', 'password-reset', 'security', 'authentication'],
        },
    },

    // Assign User to Property
    {
        pattern: /\/api\/v1\/user\/assignUserToProperty$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.USER,
            getEntityId: (req, resBody) =>
                req.body?.userId || resBody?.data?.userId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.userName ||
                req.body?.userName ||
                resBody?.data?.email ||
                req.body?.email ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const userName =
                    resBody?.data?.userName ||
                    req.body?.userName ||
                    resBody?.data?.email ||
                    req.body?.email ||
                    'user';
                const propertyName =
                    req.body?.propertyName || req.body?.propertyId || '';
                return isSuccess
                    ? `User '${userName}' assigned to property${propertyName ? ` '${propertyName}'` : ''}`
                    : `Failed to assign user '${userName}' to property`;
            },
            tags: ['user', 'property-mapping', 'update', 'access-control'],
        },
    },

    // Update User
    {
        pattern: /\/api\/v1\/user\/update\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.USER,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.userName ||
                req.body?.userName ||
                resBody?.data?.email ||
                req.body?.email ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const userName =
                    resBody?.data?.userName ||
                    req.body?.userName ||
                    resBody?.data?.email ||
                    req.body?.email ||
                    'unknown';
                return isSuccess
                    ? `User '${userName}' updated successfully`
                    : `Failed to update user '${userName}'`;
            },
            tags: ['user', 'update', 'user-management'],
        },
    },

    // Delete User
    {
        pattern: /\/api\/v1\/user\/delete\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.USER,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.userName || resBody?.data?.email || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const userName =
                    resBody?.data?.userName ||
                    resBody?.data?.email ||
                    'deleted user';
                return isSuccess
                    ? `User '${userName}' deleted successfully`
                    : `Failed to delete user`;
            },
            tags: ['user', 'delete', 'user-management'],
        },
    },
    // Fetch Rooms for Booking
    {
        pattern: /\/api\/v1\/booking-engine\/fetch-rooms$/,
        method: 'POST',
        config: {
            action: ActivityAction.EXPORT,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) => req.body?.PropertyCode || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                req.body?.PropertyCode ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    req.body?.PropertyCode ||
                    'property';
                const checkIn =
                    req.body?.checkIn || req.body?.checkInDate || '';
                const checkOut =
                    req.body?.checkOut || req.body?.checkOutDate || '';
                const dateRange =
                    checkIn && checkOut ? ` for ${checkIn} to ${checkOut}` : '';
                const roomCount =
                    resBody?.data?.rooms?.length ||
                    resBody?.data?.availableRooms?.length ||
                    0;
                return isSuccess
                    ? `Available rooms fetched for '${propertyName}'${dateRange}${roomCount > 0 ? ` (${roomCount} rooms)` : ''}`
                    : `Failed to fetch rooms for '${propertyName}'`;
            },
            tags: ['booking-engine', 'room', 'availability', 'export'],
        },
    },
    // Create Creation Loyalty
    {
        pattern: /\/api\/v1\/creation-loyalty$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.creationLoyalityId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const loyaltyName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                const creationName =
                    resBody?.data?.creationName || req.body?.creationName || '';
                return isSuccess
                    ? `Loyalty program '${loyaltyName}' created${creationName ? ` for creation '${creationName}'` : ''}`
                    : `Failed to create loyalty program '${loyaltyName}'`;
            },
            tags: ['loyalty', 'creation-loyalty', 'create', 'loyalty-config'],
        },
    },

    // Update Creation Loyalty
    {
        pattern: /\/api\/v1\/creation-loyalty\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.creationLoyalityId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const loyaltyName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                return isSuccess
                    ? `Loyalty program '${loyaltyName}' updated successfully`
                    : `Failed to update loyalty program '${loyaltyName}'`;
            },
            tags: ['loyalty', 'creation-loyalty', 'update', 'loyalty-config'],
        },
    },

    // Delete Creation Loyalty
    {
        pattern: /\/api\/v1\/creation-loyalty\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.creationLoyalityId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.programName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const loyaltyName =
                    resBody?.data?.name ||
                    resBody?.data?.programName ||
                    'deleted loyalty program';
                return isSuccess
                    ? `Loyalty program '${loyaltyName}' deleted successfully`
                    : `Failed to delete loyalty program`;
            },
            tags: ['loyalty', 'creation-loyalty', 'delete', 'loyalty-config'],
        },
    },
    // Create Loyalty Condition
    {
        pattern: /\/api\/v1\/loyalty-condition$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONDITION,
            getEntityId: (req, resBody) =>
                resBody?.data?.conditionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.conditionName ||
                req.body?.conditionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const conditionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.conditionName ||
                    req.body?.conditionName ||
                    'unknown';
                const programName =
                    resBody?.data?.programName || req.body?.programName || '';
                return isSuccess
                    ? `Loyalty condition '${conditionName}' created${programName ? ` for program '${programName}'` : ''}`
                    : `Failed to create loyalty condition '${conditionName}'`;
            },
            tags: ['loyalty', 'loyalty-condition', 'create'],
        },
    },

    // Update Loyalty Condition
    {
        pattern: /\/api\/v1\/loyalty-condition\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONDITION,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.conditionName ||
                req.body?.conditionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const conditionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.conditionName ||
                    req.body?.conditionName ||
                    'unknown';
                return isSuccess
                    ? `Loyalty condition '${conditionName}' updated successfully`
                    : `Failed to update loyalty condition '${conditionName}'`;
            },
            tags: ['loyalty', 'loyalty-condition', 'update'],
        },
    },

    // Delete Loyalty Condition
    {
        pattern: /\/api\/v1\/loyalty-condition\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONDITION,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.conditionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const conditionName =
                    resBody?.data?.name ||
                    resBody?.data?.conditionName ||
                    'deleted loyalty condition';
                return isSuccess
                    ? `Loyalty condition '${conditionName}' deleted successfully`
                    : `Failed to delete loyalty condition`;
            },
            tags: ['loyalty', 'loyalty-condition', 'delete'],
        },
    },

    // Create Special Loyalty Condition
    {
        pattern: /\/api\/v1\/loyalty-condition\/special$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONDITION,
            getEntityId: (req, resBody) =>
                resBody?.data?.conditionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.conditionName ||
                req.body?.conditionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const conditionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.conditionName ||
                    req.body?.conditionName ||
                    'unknown';
                const programName =
                    resBody?.data?.programName || req.body?.programName || '';
                return isSuccess
                    ? `Special loyalty condition '${conditionName}' created${programName ? ` for program '${programName}'` : ''}`
                    : `Failed to create special loyalty condition '${conditionName}'`;
            },
            tags: [
                'loyalty',
                'loyalty-condition',
                'special-condition',
                'create',
            ],
        },
    },

    // Update Special Loyalty Condition
    {
        pattern: /\/api\/v1\/loyalty-condition\/special\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONDITION,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.conditionName ||
                req.body?.conditionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const conditionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.conditionName ||
                    req.body?.conditionName ||
                    'unknown';
                return isSuccess
                    ? `Special loyalty condition '${conditionName}' updated successfully`
                    : `Failed to update special loyalty condition '${conditionName}'`;
            },
            tags: [
                'loyalty',
                'loyalty-condition',
                'special-condition',
                'update',
            ],
        },
    },

    // Delete Special Loyalty Condition
    {
        pattern: /\/api\/v1\/loyalty-condition\/special\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONDITION,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.conditionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const conditionName =
                    resBody?.data?.name ||
                    resBody?.data?.conditionName ||
                    'deleted special loyalty condition';
                return isSuccess
                    ? `Special loyalty condition '${conditionName}' deleted successfully`
                    : `Failed to delete special loyalty condition`;
            },
            tags: [
                'loyalty',
                'loyalty-condition',
                'special-condition',
                'delete',
            ],
        },
    },
    // Create Loyalty Field
    {
        pattern: /\/api\/v1\/loyalty-field$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.fieldId ||
                resBody?.data?._id ||
                req.body?.loyaltyProgramId ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.fieldName || req.body?.fieldName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const fieldName =
                    resBody?.data?.fieldName ||
                    req.body?.fieldName ||
                    'unknown';
                const programName =
                    resBody?.data?.programName || req.body?.programName || '';
                return isSuccess
                    ? `Loyalty field '${fieldName}' created${programName ? ` for program '${programName}'` : ''}`
                    : `Failed to create loyalty field '${fieldName}'`;
            },
            tags: ['loyalty', 'loyalty-field', 'create', 'configuration'],
        },
    },

    // Update Many Loyalty Fields
    {
        pattern: /\/api\/v1\/loyalty-field\/update-many\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.loyaltyProgramId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'loyalty program';
                const fieldCount =
                    req.body?.fields?.length ||
                    resBody?.data?.fieldsUpdated ||
                    0;
                return isSuccess
                    ? `Multiple loyalty fields updated for '${programName}'${fieldCount > 0 ? ` (${fieldCount} fields)` : ''}`
                    : `Failed to update loyalty fields for '${programName}'`;
            },
            tags: [
                'loyalty',
                'loyalty-field',
                'update',
                'bulk-update',
                'configuration',
            ],
        },
    },

    // Update Single Loyalty Field
    {
        pattern: /\/api\/v1\/loyalty-field\/[^/]+\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.loyaltyProgramId || 'unknown',
            getEntityName: (req, resBody) =>
                req.params?.fieldName || resBody?.data?.fieldName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const fieldName =
                    req.params?.fieldName ||
                    resBody?.data?.fieldName ||
                    'unknown';
                const programName =
                    resBody?.data?.programName || req.body?.programName || '';
                return isSuccess
                    ? `Loyalty field '${fieldName}' updated${programName ? ` for program '${programName}'` : ''}`
                    : `Failed to update loyalty field '${fieldName}'`;
            },
            tags: ['loyalty', 'loyalty-field', 'update', 'configuration'],
        },
    },

    // Delete Loyalty Field
    {
        pattern: /\/api\/v1\/loyalty-field\/[^/]+\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.loyaltyProgramId || 'unknown',
            getEntityName: (req, resBody) =>
                req.params?.fieldName || resBody?.data?.fieldName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const fieldName =
                    req.params?.fieldName ||
                    resBody?.data?.fieldName ||
                    'deleted field';
                const programName = resBody?.data?.programName || '';
                return isSuccess
                    ? `Loyalty field '${fieldName}' deleted${programName ? ` from program '${programName}'` : ''}`
                    : `Failed to delete loyalty field '${fieldName}'`;
            },
            tags: ['loyalty', 'loyalty-field', 'delete', 'configuration'],
        },
    },
    // Delete Loyalty Guest
    {
        pattern: /\/api\/v1\/loyalty-guest\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_GUEST,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email ||
                resBody?.data?.guestName ||
                resBody?.data?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const guestName =
                    resBody?.data?.guestName ||
                    resBody?.data?.name ||
                    resBody?.data?.email ||
                    'deleted loyalty guest';
                return isSuccess
                    ? `Loyalty guest '${guestName}' deleted successfully`
                    : `Failed to delete loyalty guest`;
            },
            tags: ['loyalty', 'loyalty-guest', 'delete'],
        },
    },

    // Register Guest from Booking Engine
    {
        pattern: /\/api\/v1\/loyalty-guest\/register$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_GUEST,
            getEntityId: (req, resBody) =>
                resBody?.data?.loyaltyGuestId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.email ||
                req.body?.email ||
                resBody?.data?.guestName ||
                req.body?.guestName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const guestName =
                    resBody?.data?.guestName ||
                    req.body?.guestName ||
                    resBody?.data?.email ||
                    req.body?.email ||
                    'unknown';
                const programName =
                    resBody?.data?.programName || req.body?.programName || '';
                return isSuccess
                    ? `Loyalty guest '${guestName}' registered${programName ? ` to program '${programName}'` : ''}`
                    : `Failed to register loyalty guest '${guestName}'`;
            },
            tags: [
                'loyalty',
                'loyalty-guest',
                'registration',
                'create',
                'booking-engine',
            ],
        },
    },
    // Create Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.loyaltyProgramId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                const creationName =
                    resBody?.data?.creationName || req.body?.creationName || '';
                return isSuccess
                    ? `Loyalty program '${programName}' created${creationName ? ` for creation '${creationName}'` : ''}`
                    : `Failed to create loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'create'],
        },
    },

    // Update Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.loyaltyProgramId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                return isSuccess
                    ? `Loyalty program '${programName}' updated successfully`
                    : `Failed to update loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'update'],
        },
    },

    // Delete Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.loyaltyProgramId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.programName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    resBody?.data?.programName ||
                    'deleted loyalty program';
                return isSuccess
                    ? `Loyalty program '${programName}' deleted successfully`
                    : `Failed to delete loyalty program`;
            },
            tags: ['loyalty', 'loyalty-program', 'delete'],
        },
    },

    // Create Advance Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/advance$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.loyaltyProgramId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                const creationName =
                    resBody?.data?.creationName || req.body?.creationName || '';
                return isSuccess
                    ? `Advance loyalty program '${programName}' created${creationName ? ` for creation '${creationName}'` : ''}`
                    : `Failed to create advance loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'advance', 'create'],
        },
    },

    // Update Advance Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/advance\/update\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                return isSuccess
                    ? `Advance loyalty program '${programName}' updated successfully`
                    : `Failed to update advance loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'advance', 'update'],
        },
    },

    // Delete Advance Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/advance\/delete\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.programName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    resBody?.data?.programName ||
                    'deleted advance loyalty program';
                return isSuccess
                    ? `Advance loyalty program '${programName}' deleted successfully`
                    : `Failed to delete advance loyalty program`;
            },
            tags: ['loyalty', 'loyalty-program', 'advance', 'delete'],
        },
    },
    // Create Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.loyaltyProgramId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                const creationName =
                    resBody?.data?.creationName || req.body?.creationName || '';
                return isSuccess
                    ? `Loyalty program '${programName}' created${creationName ? ` for creation '${creationName}'` : ''}`
                    : `Failed to create loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'create'],
        },
    },

    // Update Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.loyaltyProgramId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                return isSuccess
                    ? `Loyalty program '${programName}' updated successfully`
                    : `Failed to update loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'update'],
        },
    },

    // Delete Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.loyaltyProgramId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.programName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    resBody?.data?.programName ||
                    'deleted loyalty program';
                return isSuccess
                    ? `Loyalty program '${programName}' deleted successfully`
                    : `Failed to delete loyalty program`;
            },
            tags: ['loyalty', 'loyalty-program', 'delete'],
        },
    },

    // Create Advance Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/advance$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.loyaltyProgramId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                const creationName =
                    resBody?.data?.creationName || req.body?.creationName || '';
                return isSuccess
                    ? `Advance loyalty program '${programName}' created${creationName ? ` for creation '${creationName}'` : ''}`
                    : `Failed to create advance loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'advance', 'create'],
        },
    },

    // Update Advance Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/advance\/update\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.programName ||
                    req.body?.programName ||
                    'unknown';
                return isSuccess
                    ? `Advance loyalty program '${programName}' updated successfully`
                    : `Failed to update advance loyalty program '${programName}'`;
            },
            tags: ['loyalty', 'loyalty-program', 'advance', 'update'],
        },
    },

    // Delete Advance Loyalty Program
    {
        pattern: /\/api\/v1\/loyalty-program\/advance\/delete\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.programName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const programName =
                    resBody?.data?.name ||
                    resBody?.data?.programName ||
                    'deleted advance loyalty program';
                return isSuccess
                    ? `Advance loyalty program '${programName}' deleted successfully`
                    : `Failed to delete advance loyalty program`;
            },
            tags: ['loyalty', 'loyalty-program', 'advance', 'delete'],
        },
    },
    // Create Property Loyalty Config
    {
        pattern: /\/api\/v1\/property-loyalty$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.propertyLoyalityId ||
                resBody?.data?._id ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                resBody?.data?.programName ||
                req.body?.programName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const programName =
                    resBody?.data?.programName || req.body?.programName || '';
                return isSuccess
                    ? `Loyalty config created for property '${propertyName}'${programName ? ` with program '${programName}'` : ''}`
                    : `Failed to create loyalty config for property '${propertyName}'`;
            },
            tags: ['loyalty', 'property-loyalty', 'create', 'configuration'],
        },
    },

    // Update Property Loyalty Config
    {
        pattern: /\/api\/v1\/property-loyalty\/config\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                req.params?.propertyId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const programName =
                    resBody?.data?.programName || req.body?.programName || '';
                return isSuccess
                    ? `Loyalty config updated for property '${propertyName}'${programName ? ` (program '${programName}')` : ''}`
                    : `Failed to update loyalty config for property '${propertyName}'`;
            },
            tags: ['loyalty', 'property-loyalty', 'update', 'configuration'],
        },
    },

    // Delete Property Loyalty Config
    {
        pattern: /\/api\/v1\/property-loyalty\/config\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) => req.params?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName = resBody?.data?.propertyName || 'property';
                return isSuccess
                    ? `Loyalty config deleted for property '${propertyName}'`
                    : `Failed to delete loyalty config for property`;
            },
            tags: ['loyalty', 'property-loyalty', 'delete', 'configuration'],
        },
    },
    // Create Reservation
    {
        pattern: /\/api\/v1\/reservation$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.RESERVATION,
            getEntityId: (req, resBody) =>
                resBody?.data?.reservationId ||
                resBody?.data?._id ||
                resBody?.data?.reservationCode ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.guestName ||
                req.body?.data?.guestDetails?.guestName ||
                resBody?.data?.reservationCode ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const guestName =
                    resBody?.data?.guestName ||
                    req.body?.data?.guestDetails?.guestName ||
                    'guest';
                const reservationCode =
                    resBody?.data?.reservationCode ||
                    resBody?.data?.bookingCode ||
                    '';
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.data?.bookingDetails?.propertyName ||
                    '';
                return isSuccess
                    ? `Reservation created for '${guestName}'${reservationCode ? ` (${reservationCode})` : ''}${propertyName ? ` at '${propertyName}'` : ''}`
                    : `Failed to create reservation for '${guestName}'`;
            },
            tags: ['reservation', 'booking', 'create'],
        },
    },

    // Cancel Reservation
    {
        pattern: /\/api\/v1\/reservation\/cancel\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.CANCEL,
            entity: ActivityEntity.RESERVATION,
            getEntityId: (req, resBody) =>
                req.params?.reservationId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.reservationCode ||
                resBody?.data?.guestName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const reservationCode =
                    resBody?.data?.reservationCode ||
                    resBody?.data?.bookingCode ||
                    'reservation';
                const guestName = resBody?.data?.guestName || '';
                return isSuccess
                    ? `Reservation '${reservationCode}' cancelled${guestName ? ` (Guest: ${guestName})` : ''}`
                    : `Failed to cancel reservation '${reservationCode}'`;
            },
            tags: ['reservation', 'booking', 'cancellation', 'cancel'],
        },
    },

    // Update Reservation
    {
        pattern: /\/api\/v1\/reservation\/update\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RESERVATION,
            getEntityId: (req, resBody) =>
                req.params?.reservationCode || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                req.params?.reservationCode ||
                resBody?.data?.reservationCode ||
                resBody?.data?.guestName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const reservationCode =
                    req.params?.reservationCode ||
                    resBody?.data?.reservationCode ||
                    'reservation';
                const guestName = resBody?.data?.guestName || '';
                return isSuccess
                    ? `Reservation '${reservationCode}' updated${guestName ? ` (Guest: ${guestName})` : ''}`
                    : `Failed to update reservation '${reservationCode}'`;
            },
            tags: ['reservation', 'booking', 'update'],
        },
    },

    // No Show Reservation
    {
        pattern: /\/api\/v1\/reservation\/no-show\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RESERVATION,
            getEntityId: (req, resBody) =>
                req.params?.reservationId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.reservationCode ||
                resBody?.data?.guestName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const reservationCode =
                    resBody?.data?.reservationCode ||
                    resBody?.data?.bookingCode ||
                    'reservation';
                const guestName = resBody?.data?.guestName || '';
                return isSuccess
                    ? `Reservation '${reservationCode}' marked as no-show${guestName ? ` (Guest: ${guestName})` : ''}`
                    : `Failed to mark reservation '${reservationCode}' as no-show`;
            },
            tags: ['reservation', 'booking', 'no-show', 'update', 'status'],
        },
    },
    // Create Policy
    {
        pattern: /\/api\/v1\/policy$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.POLICY,
            getEntityId: (req, resBody) =>
                resBody?.data?.policyId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.policyName ||
                req.body?.policyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const policyName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.policyName ||
                    req.body?.policyName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                return isSuccess
                    ? `Policy '${policyName}' created${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create policy '${policyName}'`;
            },
            tags: ['policy', 'create', 'property-management'],
        },
    },

    // Update Policy
    {
        pattern: /\/api\/v1\/policy\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.POLICY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.policyName ||
                req.body?.policyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const policyName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.policyName ||
                    req.body?.policyName ||
                    'unknown';
                return isSuccess
                    ? `Policy '${policyName}' updated successfully`
                    : `Failed to update policy '${policyName}'`;
            },
            tags: ['policy', 'update', 'property-management'],
        },
    },

    // Delete Policy
    {
        pattern: /\/api\/v1\/policy\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.POLICY,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.policyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const policyName =
                    resBody?.data?.name ||
                    resBody?.data?.policyName ||
                    'deleted policy';
                return isSuccess
                    ? `Policy '${policyName}' deleted successfully`
                    : `Failed to delete policy`;
            },
            tags: ['policy', 'delete', 'property-management'],
        },
    },

    // Add Policy to Rate Plan
    {
        pattern: /\/api\/v1\/policy\/addToRatePlan$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.POLICY,
            getEntityId: (req, resBody) =>
                req.body?.policyId || resBody?.data?.policyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.policyName || req.body?.policyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const policyName =
                    resBody?.data?.policyName ||
                    req.body?.policyName ||
                    'policy';
                const ratePlanName =
                    req.body?.ratePlanName || req.body?.ratePlanCode || '';
                return isSuccess
                    ? `Policy '${policyName}' added to rate plan${ratePlanName ? ` '${ratePlanName}'` : ''}`
                    : `Failed to add policy '${policyName}' to rate plan`;
            },
            tags: ['policy', 'rate-plan', 'update', 'mapping'],
        },
    },
    // Create Promo Code
    {
        pattern: /\/api\/v1\/promo-code$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROMO_CODE,
            getEntityId: (req, resBody) =>
                resBody?.data?.promoCodeId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.code ||
                req.body?.promoCodeData?.code ||
                resBody?.data?.promoCode ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promoCode =
                    resBody?.data?.code ||
                    req.body?.promoCodeData?.code ||
                    resBody?.data?.promoCode ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const discountValue =
                    req.body?.promoCodeData?.discountValue ||
                    resBody?.data?.discountValue ||
                    '';
                return isSuccess
                    ? `Promo code '${promoCode}' created${propertyName ? ` for property '${propertyName}'` : ''}${discountValue ? ` (${discountValue})` : ''}`
                    : `Failed to create promo code '${promoCode}'`;
            },
            tags: ['promo-code', 'create', 'promotion'],
        },
    },

    // Update Promo Code
    {
        pattern: /\/api\/v1\/promo-code\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMO_CODE,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.code ||
                req.body?.code ||
                resBody?.data?.promoCode ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promoCode =
                    resBody?.data?.code ||
                    req.body?.code ||
                    resBody?.data?.promoCode ||
                    'unknown';
                return isSuccess
                    ? `Promo code '${promoCode}' updated successfully`
                    : `Failed to update promo code '${promoCode}'`;
            },
            tags: ['promo-code', 'update', 'promotion'],
        },
    },

    // Delete Promo Code
    {
        pattern: /\/api\/v1\/promo-code\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROMO_CODE,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.code || resBody?.data?.promoCode || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promoCode =
                    resBody?.data?.code ||
                    resBody?.data?.promoCode ||
                    'deleted promo code';
                return isSuccess
                    ? `Promo code '${promoCode}' deleted successfully`
                    : `Failed to delete promo code`;
            },
            tags: ['promo-code', 'delete', 'promotion'],
        },
    },

    // Recover Promo Code
    {
        pattern: /\/api\/v1\/promo-code\/recover\/[^/]+\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.RESTORE,
            entity: ActivityEntity.PROMO_CODE,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.code || resBody?.data?.promoCode || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promoCode =
                    resBody?.data?.code ||
                    resBody?.data?.promoCode ||
                    'promo code';
                return isSuccess
                    ? `Promo code '${promoCode}' recovered successfully`
                    : `Failed to recover promo code '${promoCode}'`;
            },
            tags: ['promo-code', 'restore', 'recovery', 'promotion'],
        },
    },
    // Create Customizable Deal
    {
        pattern: /\/api\/v1\/promotion\/customizable-deal$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                resBody?.data?.dealId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.dealName ||
                req.body?.dealName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const dealName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.dealName ||
                    req.body?.dealName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                return isSuccess
                    ? `Customizable deal '${dealName}' created${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create customizable deal '${dealName}'`;
            },
            tags: ['promotion', 'customizable-deal', 'create'],
        },
    },

    // Update Customizable Deal
    {
        pattern: /\/api\/v1\/promotion\/customizable-deal\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                req.params?.dealId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.dealName ||
                req.body?.dealName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const dealName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.dealName ||
                    req.body?.dealName ||
                    'unknown';
                return isSuccess
                    ? `Customizable deal '${dealName}' updated successfully`
                    : `Failed to update customizable deal '${dealName}'`;
            },
            tags: ['promotion', 'customizable-deal', 'update'],
        },
    },

    // Delete Customizable Deal
    {
        pattern: /\/api\/v1\/promotion\/customizable-deal\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) => req.params?.dealId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.dealName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const dealName =
                    resBody?.data?.name ||
                    resBody?.data?.dealName ||
                    'deleted customizable deal';
                return isSuccess
                    ? `Customizable deal '${dealName}' deleted successfully`
                    : `Failed to delete customizable deal`;
            },
            tags: ['promotion', 'customizable-deal', 'delete'],
        },
    },
    // Create Device-Specific Promotion
    {
        pattern: /\/api\/v1\/promotion\/device-specific$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                resBody?.data?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.promotionName ||
                req.body?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.promotionName ||
                    req.body?.promotionName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const deviceType =
                    req.body?.deviceType || resBody?.data?.deviceType || '';
                return isSuccess
                    ? `Device-specific promotion '${promotionName}' created${deviceType ? ` for ${deviceType}` : ''}${propertyName ? ` at property '${propertyName}'` : ''}`
                    : `Failed to create device-specific promotion '${promotionName}'`;
            },
            tags: ['promotion', 'device-specific', 'create'],
        },
    },

    // Update Device-Specific Promotion
    {
        pattern: /\/api\/v1\/promotion\/device-specific\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                req.params?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.promotionName ||
                req.body?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.promotionName ||
                    req.body?.promotionName ||
                    'unknown';
                return isSuccess
                    ? `Device-specific promotion '${promotionName}' updated successfully`
                    : `Failed to update device-specific promotion '${promotionName}'`;
            },
            tags: ['promotion', 'device-specific', 'update'],
        },
    },

    // Delete Device-Specific Promotion
    {
        pattern: /\/api\/v1\/promotion\/device-specific\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) => req.params?.promotionId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    resBody?.data?.promotionName ||
                    'deleted device-specific promotion';
                return isSuccess
                    ? `Device-specific promotion '${promotionName}' deleted successfully`
                    : `Failed to delete device-specific promotion`;
            },
            tags: ['promotion', 'device-specific', 'delete'],
        },
    },

    // Toggle Device-Specific Promotion Status
    {
        pattern: /\/api\/v1\/promotion\/device-specific\/[^/]+\/toggle-status$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                req.params?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    resBody?.data?.promotionName ||
                    'promotion';
                const status = resBody?.data?.isActive ?? req.body?.isActive;
                const statusText =
                    status === true
                        ? 'activated'
                        : status === false
                          ? 'deactivated'
                          : 'toggled';
                return isSuccess
                    ? `Device-specific promotion '${promotionName}' ${statusText} successfully`
                    : `Failed to toggle status for device-specific promotion '${promotionName}'`;
            },
            tags: [
                'promotion',
                'device-specific',
                'status',
                'update',
                'toggle',
            ],
        },
    },
    // Create Early-Bird Promotion
    {
        pattern: /\/api\/v1\/promotion\/early-bird$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                resBody?.data?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.promotionName ||
                req.body?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.promotionName ||
                    req.body?.promotionName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const advanceDays =
                    req.body?.advanceBookingDays ||
                    resBody?.data?.advanceBookingDays ||
                    '';
                return isSuccess
                    ? `Early-bird promotion '${promotionName}' created${advanceDays ? ` (${advanceDays} days advance)` : ''}${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create early-bird promotion '${promotionName}'`;
            },
            tags: ['promotion', 'early-bird', 'create'],
        },
    },

    // Update Early-Bird Promotion
    {
        pattern: /\/api\/v1\/promotion\/early-bird\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                req.params?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.promotionName ||
                req.body?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.promotionName ||
                    req.body?.promotionName ||
                    'unknown';
                return isSuccess
                    ? `Early-bird promotion '${promotionName}' updated successfully`
                    : `Failed to update early-bird promotion '${promotionName}'`;
            },
            tags: ['promotion', 'early-bird', 'update'],
        },
    },

    // Delete Early-Bird Promotion
    {
        pattern: /\/api\/v1\/promotion\/early-bird\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) => req.params?.promotionId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    resBody?.data?.promotionName ||
                    'deleted early-bird promotion';
                return isSuccess
                    ? `Early-bird promotion '${promotionName}' deleted successfully`
                    : `Failed to delete early-bird promotion`;
            },
            tags: ['promotion', 'early-bird', 'delete'],
        },
    },

    // Toggle Early-Bird Promotion Status
    {
        pattern: /\/api\/v1\/promotion\/early-bird\/[^/]+\/toggle-status$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                req.params?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    resBody?.data?.promotionName ||
                    'promotion';
                const status = resBody?.data?.isActive ?? req.body?.isActive;
                const statusText =
                    status === true
                        ? 'activated'
                        : status === false
                          ? 'deactivated'
                          : 'toggled';
                return isSuccess
                    ? `Early-bird promotion '${promotionName}' ${statusText} successfully`
                    : `Failed to toggle status for early-bird promotion '${promotionName}'`;
            },
            tags: ['promotion', 'early-bird', 'status', 'update', 'toggle'],
        },
    },
    // Create Offer-For-Tonight Promotion
    {
        pattern: /\/api\/v1\/promotion\/offer-for-tonight$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                resBody?.data?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.promotionName ||
                req.body?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.promotionName ||
                    req.body?.promotionName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const discountValue =
                    req.body?.discountValue ||
                    resBody?.data?.discountValue ||
                    '';
                return isSuccess
                    ? `Offer-for-tonight promotion '${promotionName}' created${discountValue ? ` (${discountValue}% off)` : ''}${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create offer-for-tonight promotion '${promotionName}'`;
            },
            tags: ['promotion', 'offer-for-tonight', 'create', 'last-minute'],
        },
    },

    // Update Offer-For-Tonight Promotion
    {
        pattern: /\/api\/v1\/promotion\/offer-for-tonight\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                req.params?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.promotionName ||
                req.body?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.promotionName ||
                    req.body?.promotionName ||
                    'unknown';
                return isSuccess
                    ? `Offer-for-tonight promotion '${promotionName}' updated successfully`
                    : `Failed to update offer-for-tonight promotion '${promotionName}'`;
            },
            tags: ['promotion', 'offer-for-tonight', 'update', 'last-minute'],
        },
    },

    // Delete Offer-For-Tonight Promotion
    {
        pattern: /\/api\/v1\/promotion\/offer-for-tonight\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) => req.params?.promotionId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    resBody?.data?.promotionName ||
                    'deleted offer-for-tonight promotion';
                return isSuccess
                    ? `Offer-for-tonight promotion '${promotionName}' deleted successfully`
                    : `Failed to delete offer-for-tonight promotion`;
            },
            tags: ['promotion', 'offer-for-tonight', 'delete', 'last-minute'],
        },
    },

    // Toggle Offer-For-Tonight Promotion Status
    {
        pattern:
            /\/api\/v1\/promotion\/offer-for-tonight\/[^/]+\/toggle-status$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROMOTION,
            getEntityId: (req, resBody) =>
                req.params?.promotionId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                resBody?.data?.promotionName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const promotionName =
                    resBody?.data?.name ||
                    resBody?.data?.promotionName ||
                    'promotion';
                const status = resBody?.data?.isActive ?? req.body?.isActive;
                const statusText =
                    status === true
                        ? 'activated'
                        : status === false
                          ? 'deactivated'
                          : 'toggled';
                return isSuccess
                    ? `Offer-for-tonight promotion '${promotionName}' ${statusText} successfully`
                    : `Failed to toggle status for offer-for-tonight promotion '${promotionName}'`;
            },
            tags: [
                'promotion',
                'offer-for-tonight',
                'status',
                'update',
                'toggle',
                'last-minute',
            ],
        },
    },
    // Create Geo Rate Plan
    {
        pattern: /\/api\/v1\/promotion\/geo-rate-plan$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.GEO_RATE_PLAN,
            getEntityId: (req, resBody) =>
                resBody?.data?.geoRatePlanId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.planName ||
                req.body?.planName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const planName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.planName ||
                    req.body?.planName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const countries =
                    req.body?.countries || resBody?.data?.countries || [];
                const countryInfo =
                    countries.length > 0
                        ? ` for ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}`
                        : '';
                return isSuccess
                    ? `Geo rate plan '${planName}' created${countryInfo}${propertyName ? ` at property '${propertyName}'` : ''}`
                    : `Failed to create geo rate plan '${planName}'`;
            },
            tags: ['promotion', 'geo-rate-plan', 'create', 'geographic'],
        },
    },

    // Update Geo Rate Plan
    {
        pattern: /\/api\/v1\/promotion\/geo-rate-plan\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.GEO_RATE_PLAN,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.planName ||
                req.body?.planName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const planName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.planName ||
                    req.body?.planName ||
                    'unknown';
                return isSuccess
                    ? `Geo rate plan '${planName}' updated successfully`
                    : `Failed to update geo rate plan '${planName}'`;
            },
            tags: ['promotion', 'geo-rate-plan', 'update', 'geographic'],
        },
    },

    // Delete Geo Rate Plan
    {
        pattern: /\/api\/v1\/promotion\/geo-rate-plan\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.GEO_RATE_PLAN,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.planName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const planName =
                    resBody?.data?.name ||
                    resBody?.data?.planName ||
                    'deleted geo rate plan';
                return isSuccess
                    ? `Geo rate plan '${planName}' deleted successfully`
                    : `Failed to delete geo rate plan`;
            },
            tags: ['promotion', 'geo-rate-plan', 'delete', 'geographic'],
        },
    },
    // Create MLOS Rate Plan Rule
    {
        pattern: /\/api\/v1\/promotion\/mlos$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.RATE_PLAN_RULE,
            getEntityId: (req, resBody) =>
                resBody?.data?.ruleId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.ruleName ||
                req.body?.ruleName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ruleName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.ruleName ||
                    req.body?.ruleName ||
                    'MLOS rule';
                const ratePlanName =
                    req.body?.ratePlanName || resBody?.data?.ratePlanName || '';
                const minLOS = req.body?.minLOS || resBody?.data?.minLOS || '';
                return isSuccess
                    ? `MLOS rule '${ruleName}' created${minLOS ? ` (Min LOS: ${minLOS})` : ''}${ratePlanName ? ` for rate plan '${ratePlanName}'` : ''}`
                    : `Failed to create MLOS rule '${ruleName}'`;
            },
            tags: [
                'promotion',
                'mlos',
                'rate-plan-rule',
                'create',
                'restrictions',
            ],
        },
    },

    // Update MLOS Rate Plan Rule
    {
        pattern: /\/api\/v1\/promotion\/mlos\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.RATE_PLAN_RULE,
            getEntityId: (req, resBody) =>
                req.params?.ratePlanId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.ruleName ||
                req.body?.ruleName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ruleName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.ruleName ||
                    req.body?.ruleName ||
                    'MLOS rule';
                const minLOS = req.body?.minLOS || resBody?.data?.minLOS || '';
                return isSuccess
                    ? `MLOS rule '${ruleName}' updated${minLOS ? ` (Min LOS: ${minLOS})` : ''}`
                    : `Failed to update MLOS rule '${ruleName}'`;
            },
            tags: [
                'promotion',
                'mlos',
                'rate-plan-rule',
                'update',
                'restrictions',
            ],
        },
    },

    // Delete MLOS Rate Plan Rule
    {
        pattern: /\/api\/v1\/promotion\/mlos\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.RATE_PLAN_RULE,
            getEntityId: (req, resBody) => req.params?.ratePlanId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.ruleName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ruleName =
                    resBody?.data?.name ||
                    resBody?.data?.ruleName ||
                    'deleted MLOS rule';
                return isSuccess
                    ? `MLOS rule '${ruleName}' deleted successfully`
                    : `Failed to delete MLOS rule`;
            },
            tags: [
                'promotion',
                'mlos',
                'rate-plan-rule',
                'delete',
                'restrictions',
            ],
        },
    },
    // Create Booking Engine Config
    {
        pattern: /\/api\/v1\/booking-engine\/[^/]+$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                return isSuccess
                    ? `Booking engine configuration created for property '${propertyName}'`
                    : `Failed to create booking engine configuration for property '${propertyName}'`;
            },
            tags: [
                'booking-engine',
                'configuration',
                'create',
                'property-management',
            ],
        },
    },

    // Update Booking Engine Config
    {
        pattern: /\/api\/v1\/booking-engine\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                return isSuccess
                    ? `Booking engine configuration updated for property '${propertyName}'`
                    : `Failed to update booking engine configuration for property '${propertyName}'`;
            },
            tags: [
                'booking-engine',
                'configuration',
                'update',
                'property-management',
            ],
        },
    },

    // Delete Booking Engine Config
    {
        pattern: /\/api\/v1\/booking-engine\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName = resBody?.data?.propertyName || 'property';
                return isSuccess
                    ? `Booking engine configuration deleted for property '${propertyName}'`
                    : `Failed to delete booking engine configuration for property`;
            },
            tags: [
                'booking-engine',
                'configuration',
                'delete',
                'property-management',
            ],
        },
    }, // Create Category
    {
        pattern: /\/api\/v1\/management\/category\/create$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.MASTER_CATEGORY,
            getEntityId: (req, resBody) =>
                resBody?.data?.categoryId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.categoryName ||
                req.body?.categoryName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const categoryName =
                    resBody?.data?.categoryName ||
                    req.body?.categoryName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                return isSuccess
                    ? `Category '${categoryName}' created successfully`
                    : `Failed to create category '${categoryName}'`;
            },
            tags: ['management', 'category', 'master-data', 'create'],
        },
    },

    // Delete Category
    {
        pattern: /\/api\/v1\/management\/category\/delete\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.MASTER_CATEGORY,
            getEntityId: (req, resBody) =>
                req.params?.categoryName || 'unknown',
            getEntityName: (req, resBody) =>
                req.params?.categoryName ||
                resBody?.data?.categoryName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const categoryName =
                    req.params?.categoryName ||
                    resBody?.data?.categoryName ||
                    'deleted category';
                return isSuccess
                    ? `Category '${categoryName}' deleted successfully`
                    : `Failed to delete category '${categoryName}'`;
            },
            tags: ['management', 'category', 'master-data', 'delete'],
        },
    },

    // Create Property Type
    {
        pattern: /\/api\/v1\/management\/type\/create$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.MASTER_TYPE,
            getEntityId: (req, resBody) =>
                resBody?.data?.typeId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyTypeName ||
                req.body?.propertyTypeName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const typeName =
                    resBody?.data?.propertyTypeName ||
                    req.body?.propertyTypeName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                return isSuccess
                    ? `Property type '${typeName}' created successfully`
                    : `Failed to create property type '${typeName}'`;
            },
            tags: ['management', 'property-type', 'master-data', 'create'],
        },
    },

    // Delete Property Type
    {
        pattern: /\/api\/v1\/management\/type\/delete\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.MASTER_TYPE,
            getEntityId: (req, resBody) =>
                req.params?.propertyTypeName || 'unknown',
            getEntityName: (req, resBody) =>
                req.params?.propertyTypeName ||
                resBody?.data?.propertyTypeName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const typeName =
                    req.params?.propertyTypeName ||
                    resBody?.data?.propertyTypeName ||
                    'deleted property type';
                return isSuccess
                    ? `Property type '${typeName}' deleted successfully`
                    : `Failed to delete property type '${typeName}'`;
            },
            tags: ['management', 'property-type', 'master-data', 'delete'],
        },
    },

    // Create Amenity
    {
        pattern: /\/api\/v1\/management\/amenity\/create$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.MASTER_AMENITY,
            getEntityId: (req, resBody) =>
                resBody?.data?.amenityId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.amenityName ||
                req.body?.amenityName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const amenityName =
                    resBody?.data?.amenityName ||
                    req.body?.amenityName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                return isSuccess
                    ? `Amenity '${amenityName}' created successfully`
                    : `Failed to create amenity '${amenityName}'`;
            },
            tags: ['management', 'amenity', 'master-data', 'create'],
        },
    },

    // Update/Delete Amenities
    {
        pattern: /\/api\/v1\/management\/amenity\/update$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.MASTER_AMENITY,
            getEntityId: (req, resBody) =>
                req.body?.amenityId || resBody?.data?.amenityId || 'unknown',
            getEntityName: (req, resBody) =>
                req.body?.amenityName ||
                resBody?.data?.amenityName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const amenityName =
                    req.body?.amenityName ||
                    resBody?.data?.amenityName ||
                    'amenities';
                return isSuccess
                    ? `Amenities updated successfully`
                    : `Failed to update amenities`;
            },
            tags: ['management', 'amenity', 'master-data', 'update'],
        },
    },

    // Create Room Amenity
    {
        pattern: /\/api\/v1\/management\/amenity\/room\/create$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.MASTER_AMENITY,
            getEntityId: (req, resBody) =>
                resBody?.data?.amenityId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.amenityName ||
                req.body?.amenityName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const amenityName =
                    resBody?.data?.amenityName ||
                    req.body?.amenityName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                return isSuccess
                    ? `Room amenity '${amenityName}' created successfully`
                    : `Failed to create room amenity '${amenityName}'`;
            },
            tags: [
                'management',
                'amenity',
                'room-amenity',
                'master-data',
                'create',
            ],
        },
    },

    // Update/Delete Room Amenities
    {
        pattern: /\/api\/v1\/management\/amenity\/room\/update$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.MASTER_AMENITY,
            getEntityId: (req, resBody) =>
                req.body?.amenityId || resBody?.data?.amenityId || 'unknown',
            getEntityName: (req, resBody) =>
                req.body?.amenityName ||
                resBody?.data?.amenityName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                return isSuccess
                    ? `Room amenities updated successfully`
                    : `Failed to update room amenities`;
            },
            tags: [
                'management',
                'amenity',
                'room-amenity',
                'master-data',
                'update',
            ],
        },
    },

    // Create Loyalty Guest Field
    {
        pattern: /\/api\/v1\/management\/loyalty-guest-field$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) =>
                resBody?.data?.fieldId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.fieldName ||
                req.body?.fieldName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const fieldName =
                    resBody?.data?.fieldName ||
                    req.body?.fieldName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                return isSuccess
                    ? `Loyalty guest field '${fieldName}' created successfully`
                    : `Failed to create loyalty guest field '${fieldName}'`;
            },
            tags: [
                'management',
                'loyalty',
                'guest-field',
                'master-data',
                'create',
            ],
        },
    },

    // Delete Loyalty Guest Field
    {
        pattern: /\/api\/v1\/management\/loyalty-guest-field\/[^/]+$/,
        method: 'POST',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.LOYALTY_CONFIG,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.fieldName || resBody?.data?.name || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const fieldName =
                    resBody?.data?.fieldName ||
                    resBody?.data?.name ||
                    'deleted loyalty guest field';
                return isSuccess
                    ? `Loyalty guest field '${fieldName}' deleted successfully`
                    : `Failed to delete loyalty guest field`;
            },
            tags: [
                'management',
                'loyalty',
                'guest-field',
                'master-data',
                'delete',
            ],
        },
    },
    // Add Bank Details
    {
        pattern: /\/api\/v1\/payment-details$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                resBody?.data?.propertyId || req.body?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const bankName =
                    req.body?.bankName || resBody?.data?.bankName || '';
                return isSuccess
                    ? `Bank details added for property '${propertyName}'${bankName ? ` (${bankName})` : ''}`
                    : `Failed to add bank details for property '${propertyName}'`;
            },
            tags: ['payment', 'bank-details', 'create', 'property-management'],
        },
    },

    // Update Payment Methods
    {
        pattern: /\/api\/v1\/payment-details$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                resBody?.data?.propertyId || req.body?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const paymentMethods =
                    req.body?.paymentMethods ||
                    resBody?.data?.paymentMethods ||
                    [];
                const methodCount = Array.isArray(paymentMethods)
                    ? paymentMethods.length
                    : 0;
                return isSuccess
                    ? `Payment methods updated for property '${propertyName}'${methodCount > 0 ? ` (${methodCount} methods)` : ''}`
                    : `Failed to update payment methods for property '${propertyName}'`;
            },
            tags: [
                'payment',
                'payment-methods',
                'update',
                'property-management',
            ],
        },
    },
    // Update Property Config
    {
        pattern: /\/api\/v1\/property-config\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.propertyId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                return isSuccess
                    ? `Property configuration updated for '${propertyName}'`
                    : `Failed to update property configuration for '${propertyName}'`;
            },
            tags: [
                'property',
                'configuration',
                'update',
                'property-management',
            ],
        },
    },
    // Create Property
    {
        pattern: /\/api\/v1\/property$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                resBody?.data?.propertyId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                const propertyCode =
                    resBody?.data?.propertyCode || req.body?.propertyCode || '';
                return isSuccess
                    ? `Property '${propertyName}' created${propertyCode ? ` (${propertyCode})` : ''}`
                    : `Failed to create property '${propertyName}'`;
            },
            tags: ['property', 'create', 'property-management'],
        },
    },

    // Update Property
    {
        pattern: /\/api\/v1\/property\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                return isSuccess
                    ? `Property '${propertyName}' updated successfully`
                    : `Failed to update property '${propertyName}'`;
            },
            tags: ['property', 'update', 'property-management'],
        },
    },

    // Delete Property
    {
        pattern: /\/api\/v1\/property\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName || resBody?.data?.name || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    resBody?.data?.name ||
                    'deleted property';
                return isSuccess
                    ? `Property '${propertyName}' deleted successfully`
                    : `Failed to delete property`;
            },
            tags: ['property', 'delete', 'property-management'],
        },
    },
    // Create Property Address
    {
        pattern: /\/api\/v1\/property\/[^/]+\/address$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const city = req.body?.city || resBody?.data?.city || '';
                const country =
                    req.body?.country || resBody?.data?.country || '';
                const location =
                    city && country
                        ? ` (${city}, ${country})`
                        : city
                          ? ` (${city})`
                          : country
                            ? ` (${country})`
                            : '';
                return isSuccess
                    ? `Address added for property '${propertyName}'${location}`
                    : `Failed to add address for property '${propertyName}'`;
            },
            tags: ['property', 'address', 'create', 'property-management'],
        },
    },

    // Update Property Address
    {
        pattern: /\/api\/v1\/property\/[^/]+\/address$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                return isSuccess
                    ? `Address updated for property '${propertyName}'`
                    : `Failed to update address for property '${propertyName}'`;
            },
            tags: ['property', 'address', 'update', 'property-management'],
        },
    },

    // Delete Property Address
    {
        pattern: /\/api\/v1\/property\/[^/]+\/address$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName = resBody?.data?.propertyName || 'property';
                return isSuccess
                    ? `Address deleted for property '${propertyName}'`
                    : `Failed to delete address for property`;
            },
            tags: ['property', 'address', 'delete', 'property-management'],
        },
    },
    // Create Property Amenity
    {
        pattern: /\/api\/v1\/property\/[^/]+\/amenity$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const amenities =
                    req.body?.amenities || resBody?.data?.amenities || [];
                const amenityCount = Array.isArray(amenities)
                    ? amenities.length
                    : 0;
                return isSuccess
                    ? `Amenities added for property '${propertyName}'${amenityCount > 0 ? ` (${amenityCount} amenities)` : ''}`
                    : `Failed to add amenities for property '${propertyName}'`;
            },
            tags: ['property', 'amenity', 'create', 'property-management'],
        },
    },

    // Update Property Amenity
    {
        pattern: /\/api\/v1\/property\/[^/]+\/amenity$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.id || resBody?.data?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                return isSuccess
                    ? `Amenities updated for property '${propertyName}'`
                    : `Failed to update amenities for property '${propertyName}'`;
            },
            tags: ['property', 'amenity', 'update', 'property-management'],
        },
    },

    // Delete Property Amenity
    {
        pattern: /\/api\/v1\/property\/[^/]+\/amenity$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) => req.params?.id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName = resBody?.data?.propertyName || 'property';
                return isSuccess
                    ? `Amenities deleted for property '${propertyName}'`
                    : `Failed to delete amenities for property`;
            },
            tags: ['property', 'amenity', 'delete', 'property-management'],
        },
    },
    // Create Room
    {
        pattern: /\/api\/v1\/property\/[^/]+\/room$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) =>
                resBody?.data?.roomId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName ||
                req.body?.roomName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName =
                    resBody?.data?.roomName ||
                    req.body?.roomName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const roomType =
                    req.body?.roomType || resBody?.data?.roomType || '';
                return isSuccess
                    ? `Room '${roomName}' created${roomType ? ` (${roomType})` : ''}${propertyName ? ` at property '${propertyName}'` : ''}`
                    : `Failed to create room '${roomName}'`;
            },
            tags: ['room', 'create', 'property-management'],
        },
    },

    // Update Room
    {
        pattern: /\/api\/v1\/property\/[^/]+\/room\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) =>
                req.params?.roomId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName ||
                req.body?.roomName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName =
                    resBody?.data?.roomName ||
                    req.body?.roomName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'unknown';
                return isSuccess
                    ? `Room '${roomName}' updated successfully`
                    : `Failed to update room '${roomName}'`;
            },
            tags: ['room', 'update', 'property-management'],
        },
    },

    // Delete Room
    {
        pattern: /\/api\/v1\/property\/[^/]+\/room\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) => req.params?.roomId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName || resBody?.data?.name || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName =
                    resBody?.data?.roomName ||
                    resBody?.data?.name ||
                    'deleted room';
                return isSuccess
                    ? `Room '${roomName}' deleted successfully`
                    : `Failed to delete room`;
            },
            tags: ['room', 'delete', 'property-management'],
        },
    },

    // Add 360 Image to Room
    {
        pattern: /\/api\/v1\/property\/[^/]+\/room\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) =>
                req.params?.roomId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName ||
                req.body?.roomName ||
                resBody?.data?.name ||
                req.body?.name ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName =
                    resBody?.data?.roomName ||
                    req.body?.roomName ||
                    resBody?.data?.name ||
                    req.body?.name ||
                    'room';
                return isSuccess
                    ? `360 image added to room '${roomName}'`
                    : `Failed to add 360 image to room '${roomName}'`;
            },
            tags: ['room', 'update', '360-image', 'property-management'],
        },
    },
    // Create Room Amenity
    {
        pattern: /\/api\/v1\/property\/[^/]+\/room\/aminity\/[^/]+$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) =>
                req.params?.roomId || resBody?.data?.roomId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName || req.body?.roomName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName =
                    resBody?.data?.roomName || req.body?.roomName || 'room';
                const amenities =
                    req.body?.amenities || resBody?.data?.amenities || [];
                const amenityCount = Array.isArray(amenities)
                    ? amenities.length
                    : 0;
                return isSuccess
                    ? `Amenities added to room '${roomName}'${amenityCount > 0 ? ` (${amenityCount} amenities)` : ''}`
                    : `Failed to add amenities to room '${roomName}'`;
            },
            tags: ['room', 'amenity', 'create', 'property-management'],
        },
    },

    // Update Room Amenity
    {
        pattern: /\/api\/v1\/property\/[^/]+\/room\/aminity\/[^/]+$/,
        method: 'PATCH',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) =>
                req.params?.roomId || resBody?.data?.roomId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName || req.body?.roomName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName =
                    resBody?.data?.roomName || req.body?.roomName || 'room';
                return isSuccess
                    ? `Amenities updated for room '${roomName}'`
                    : `Failed to update amenities for room '${roomName}'`;
            },
            tags: ['room', 'amenity', 'update', 'property-management'],
        },
    },

    // Delete Room Amenity
    {
        pattern: /\/api\/v1\/property\/[^/]+\/room\/aminity\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) => req.params?.roomId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName = resBody?.data?.roomName || 'room';
                return isSuccess
                    ? `Amenities deleted from room '${roomName}'`
                    : `Failed to delete amenities from room`;
            },
            tags: ['room', 'amenity', 'delete', 'property-management'],
        },
    },
    // Create Property Video
    {
        pattern: /\/api\/v1\/property\/video\/property\/[^/]+$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) =>
                req.params?.propertyId ||
                resBody?.data?.propertyId ||
                'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName ||
                req.body?.propertyName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName =
                    resBody?.data?.propertyName ||
                    req.body?.propertyName ||
                    'property';
                const videoUrl =
                    req.body?.videoUrl || resBody?.data?.videoUrl || '';
                return isSuccess
                    ? `Video added to property '${propertyName}'${videoUrl ? ` (${videoUrl})` : ''}`
                    : `Failed to add video to property '${propertyName}'`;
            },
            tags: ['property', 'video', 'create', 'media'],
        },
    },

    // Delete Property Video
    {
        pattern: /\/api\/v1\/property\/video\/property\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.PROPERTY,
            getEntityId: (req, resBody) => req.params?.propertyId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.propertyName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const propertyName = resBody?.data?.propertyName || 'property';
                return isSuccess
                    ? `Video deleted from property '${propertyName}'`
                    : `Failed to delete video from property`;
            },
            tags: ['property', 'video', 'delete', 'media'],
        },
    },

    // Create Room Video
    {
        pattern: /\/api\/v1\/property\/video\/room\/[^/]+$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) =>
                req.params?.roomId || resBody?.data?.roomId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName || req.body?.roomName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName =
                    resBody?.data?.roomName || req.body?.roomName || 'room';
                const videoUrl =
                    req.body?.videoUrl || resBody?.data?.videoUrl || '';
                return isSuccess
                    ? `Video added to room '${roomName}'${videoUrl ? ` (${videoUrl})` : ''}`
                    : `Failed to add video to room '${roomName}'`;
            },
            tags: ['room', 'video', 'create', 'media'],
        },
    },

    // Delete Room Video
    {
        pattern: /\/api\/v1\/property\/video\/room\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.ROOM,
            getEntityId: (req, resBody) => req.params?.roomId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.roomName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const roomName = resBody?.data?.roomName || 'room';
                return isSuccess
                    ? `Video deleted from room '${roomName}'`
                    : `Failed to delete video from room`;
            },
            tags: ['room', 'video', 'delete', 'media'],
        },
    },
    // Create Tax Group
    {
        pattern: /\/api\/v1\/tax-group$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.TAX_GROUP,
            getEntityId: (req, resBody) =>
                resBody?.data?.taxGroupId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.groupName ||
                req.body?.groupName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const groupName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.groupName ||
                    req.body?.groupName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                return isSuccess
                    ? `Tax group '${groupName}' created${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create tax group '${groupName}'`;
            },
            tags: ['tax', 'tax-group', 'create', 'taxation'],
        },
    },

    // Update Tax Group
    {
        pattern: /\/api\/v1\/tax-group\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.TAX_GROUP,
            getEntityId: (req, resBody) =>
                req.params?.taxGroupId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.groupName ||
                req.body?.groupName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const groupName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.groupName ||
                    req.body?.groupName ||
                    'unknown';
                return isSuccess
                    ? `Tax group '${groupName}' updated successfully`
                    : `Failed to update tax group '${groupName}'`;
            },
            tags: ['tax', 'tax-group', 'update', 'taxation'],
        },
    },

    // Delete Tax Group
    {
        pattern: /\/api\/v1\/tax-group\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.TAX_GROUP,
            getEntityId: (req, resBody) => req.params?.taxGroupId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.groupName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const groupName =
                    resBody?.data?.name ||
                    resBody?.data?.groupName ||
                    'deleted tax group';
                return isSuccess
                    ? `Tax group '${groupName}' deleted successfully`
                    : `Failed to delete tax group`;
            },
            tags: ['tax', 'tax-group', 'delete', 'taxation'],
        },
    },

    // Add Rules to Tax Group
    {
        pattern: /\/api\/v1\/tax-group\/[^/]+\/add-rules$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.TAX_GROUP,
            getEntityId: (req, resBody) => req.params?.taxGroupId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.groupName || req.body?.groupName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const groupName =
                    resBody?.data?.groupName ||
                    req.body?.groupName ||
                    'tax group';
                const rules = req.body?.rules || req.body?.taxRules || [];
                const ruleCount = Array.isArray(rules) ? rules.length : 0;
                return isSuccess
                    ? `Tax rules added to group '${groupName}'${ruleCount > 0 ? ` (${ruleCount} rules)` : ''}`
                    : `Failed to add tax rules to group '${groupName}'`;
            },
            tags: ['tax', 'tax-group', 'tax-rule', 'update', 'taxation'],
        },
    },

    // Remove Rules from Tax Group
    {
        pattern: /\/api\/v1\/tax-group\/[^/]+\/remove-rules$/,
        method: 'POST',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.TAX_GROUP,
            getEntityId: (req, resBody) => req.params?.taxGroupId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.groupName || req.body?.groupName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const groupName =
                    resBody?.data?.groupName ||
                    req.body?.groupName ||
                    'tax group';
                const rules = req.body?.rules || req.body?.taxRules || [];
                const ruleCount = Array.isArray(rules) ? rules.length : 0;
                return isSuccess
                    ? `Tax rules removed from group '${groupName}'${ruleCount > 0 ? ` (${ruleCount} rules)` : ''}`
                    : `Failed to remove tax rules from group '${groupName}'`;
            },
            tags: ['tax', 'tax-group', 'tax-rule', 'update', 'taxation'],
        },
    },

    // Create Tax Rule
    {
        pattern: /\/api\/v1\/tax-rule$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.TAX_RULE,
            getEntityId: (req, resBody) =>
                resBody?.data?.taxRuleId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.ruleName ||
                req.body?.ruleName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ruleName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.ruleName ||
                    req.body?.ruleName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const taxRate = req.body?.rate || resBody?.data?.rate || '';
                return isSuccess
                    ? `Tax rule '${ruleName}' created${taxRate ? ` (${taxRate}%)` : ''}${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create tax rule '${ruleName}'`;
            },
            tags: ['tax', 'tax-rule', 'create', 'taxation'],
        },
    },

    // Update Tax Rule
    {
        pattern: /\/api\/v1\/tax-rule\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.TAX_RULE,
            getEntityId: (req, resBody) =>
                req.params?.taxRuleId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.ruleName ||
                req.body?.ruleName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ruleName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.ruleName ||
                    req.body?.ruleName ||
                    'unknown';
                return isSuccess
                    ? `Tax rule '${ruleName}' updated successfully`
                    : `Failed to update tax rule '${ruleName}'`;
            },
            tags: ['tax', 'tax-rule', 'update', 'taxation'],
        },
    },

    // Delete Tax Rule
    {
        pattern: /\/api\/v1\/tax-rule\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.TAX_RULE,
            getEntityId: (req, resBody) => req.params?.taxRuleId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.ruleName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const ruleName =
                    resBody?.data?.name ||
                    resBody?.data?.ruleName ||
                    'deleted tax rule';
                return isSuccess
                    ? `Tax rule '${ruleName}' deleted successfully`
                    : `Failed to delete tax rule`;
            },
            tags: ['tax', 'tax-rule', 'delete', 'taxation'],
        },
    },

    // Create Tourist Tax
    {
        pattern: /\/api\/v1\/tourist-tax$/,
        method: 'POST',
        config: {
            action: ActivityAction.CREATE,
            entity: ActivityEntity.TAX_RULE,
            getEntityId: (req, resBody) =>
                resBody?.data?.touristTaxId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.taxName ||
                req.body?.taxName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const taxName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.taxName ||
                    req.body?.taxName ||
                    'unknown';
                const propertyName =
                    resBody?.data?.propertyName || req.body?.propertyName || '';
                const taxAmount =
                    req.body?.amount || resBody?.data?.amount || '';
                return isSuccess
                    ? `Tourist tax '${taxName}' created${taxAmount ? ` (${taxAmount})` : ''}${propertyName ? ` for property '${propertyName}'` : ''}`
                    : `Failed to create tourist tax '${taxName}'`;
            },
            tags: ['tax', 'tourist-tax', 'create', 'taxation'],
        },
    },

    // Update Tourist Tax
    {
        pattern: /\/api\/v1\/tourist-tax\/[^/]+$/,
        method: 'PUT',
        config: {
            action: ActivityAction.UPDATE,
            entity: ActivityEntity.TAX_RULE,
            getEntityId: (req, resBody) =>
                req.params?.touristTaxId || resBody?.data?._id || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name ||
                req.body?.name ||
                resBody?.data?.taxName ||
                req.body?.taxName ||
                'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const taxName =
                    resBody?.data?.name ||
                    req.body?.name ||
                    resBody?.data?.taxName ||
                    req.body?.taxName ||
                    'unknown';
                return isSuccess
                    ? `Tourist tax '${taxName}' updated successfully`
                    : `Failed to update tourist tax '${taxName}'`;
            },
            tags: ['tax', 'tourist-tax', 'update', 'taxation'],
        },
    },

    // Delete Tourist Tax
    {
        pattern: /\/api\/v1\/tourist-tax\/[^/]+$/,
        method: 'DELETE',
        config: {
            action: ActivityAction.DELETE,
            entity: ActivityEntity.TAX_RULE,
            getEntityId: (req, resBody) =>
                req.params?.touristTaxId || 'unknown',
            getEntityName: (req, resBody) =>
                resBody?.data?.name || resBody?.data?.taxName || 'unknown',
            getDescription: (req, resBody, statusCode) => {
                const isSuccess = statusCode! >= 200 && statusCode! < 300;
                const taxName =
                    resBody?.data?.name ||
                    resBody?.data?.taxName ||
                    'deleted tourist tax';
                return isSuccess
                    ? `Tourist tax '${taxName}' deleted successfully`
                    : `Failed to delete tourist tax`;
            },
            tags: ['tax', 'tourist-tax', 'delete', 'taxation'],
        },
    },
];

// Combined routes for use in your application
export const ALL_ACTIVITY_LOGGER_ROUTES: RoutePattern[] = [
    ...SIMPLIFIED_ACTIVITY_LOGGER_ROUTES,
];
