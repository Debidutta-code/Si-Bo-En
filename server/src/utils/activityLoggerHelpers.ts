import { ActivityAction, ActivityEntity } from '../logs/model/activity.model';
import { IActivityConfig } from './activityLogger';
import { CustomRequest } from './customRequest';
import { AgentRequest } from '../agent-paltform/utils';

// Union type for all possible request types
type AnyCustomRequest = CustomRequest | AgentRequest;

export const createCRUDConfig = (
  entity: ActivityEntity,
  entityNameField: string = 'name',
  options?: {
    skipCreate?: boolean;
    skipUpdate?: boolean;
    skipDelete?: boolean;
    customTags?: string[];
  }
): IActivityConfig[] => {
  const configs: IActivityConfig[] = [];
  const tags = options?.customTags || [entity.toLowerCase()];

  if (!options?.skipCreate) {
    configs.push({
      action: ActivityAction.CREATE,
      entity,
      getEntityId: (req, resBody) => resBody?.data?.id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[entityNameField] || req.body?.[entityNameField],
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = req.body?.[entityNameField] || entity;
        return isSuccess 
          ? `${entity} "${name}" created successfully`
          : `Failed to create ${entity}`;
      },
      tags: [...tags, 'create']
    });
  }

  if (!options?.skipUpdate) {
    configs.push({
      action: ActivityAction.UPDATE,
      entity,
      getEntityId: (req) => req.params?.id || req.params?.[`${entity.toLowerCase()}Id`] || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[entityNameField] || req.body?.[entityNameField],
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        return isSuccess 
          ? `${entity} updated successfully`
          : `Failed to update ${entity}`;
      },
      tags: [...tags, 'update']
    });
  }

  if (!options?.skipDelete) {
    configs.push({
      action: ActivityAction.DELETE,
      entity,
      getEntityId: (req) => req.params?.id || req.params?.[`${entity.toLowerCase()}Id`] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        return isSuccess 
          ? `${entity} deleted successfully`
          : `Failed to delete ${entity}`;
      },
      tags: [...tags, 'delete']
    });
  }

  return configs;
};

/**
 * Helper to create auth-related configurations
 */
export const createAuthConfig = (
  action: ActivityAction,
  description: (req: AnyCustomRequest, resBody?: any, statusCode?: number) => string,
  tags: string[] = []
): IActivityConfig => ({
  action,
  entity: ActivityEntity.USER,
  getEntityId: (req, resBody) => resBody?.data?.id || (req as CustomRequest).user?.id || req.body?.email || 'unknown',
  getEntityName: (req, resBody) => resBody?.data?.email || (req as CustomRequest).user?.email || req.body?.email || 'unknown',
  getDescription: description,
  tags: ['authentication', ...tags]
});

export const createSimpleConfig = (
  action: ActivityAction,
  entity: ActivityEntity,
  getMessage: (success: boolean) => string,
  tags: string[] = []
): IActivityConfig => ({
  action,
  entity,
  getEntityId: (req, resBody) => resBody?.data?.id || req.params?.id || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    return getMessage(isSuccess);
  },
  tags
});

export const logOnlySuccess: IActivityConfig['shouldLog'] = (req, resBody, statusCode) => {
  return statusCode !== undefined && statusCode >= 200 && statusCode < 300;
};

export const logOnlyFailures: IActivityConfig['shouldLog'] = (req, resBody, statusCode) => {
  return statusCode !== undefined && statusCode >= 400;
};

export const logCriticalOnly = (criticalActions: ActivityAction[]): IActivityConfig['shouldLog'] => {
  return (req, resBody, statusCode) => {
    return statusCode !== undefined;
  };
};

export const createCheckInOutConfig = (action: ActivityAction.CHECKIN | ActivityAction.CHECKOUT): IActivityConfig => ({
  action,
  entity: ActivityEntity.RESERVATION,
  getEntityId: (req) => req.params?.reservationId || req.params?.id || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    const actionText = action === ActivityAction.CHECKIN ? 'checked in' : 'checked out';
    return isSuccess 
      ? `Guest ${actionText} successfully`
      : `Failed to ${action} guest`;
  },
  tags: ['booking', action.toString()]
});

export const createPaymentConfig = (
  entity: ActivityEntity.PAYMENT | ActivityEntity.REFUND
): IActivityConfig => ({
  action: ActivityAction.CREATE,
  entity,
  getEntityId: (req, resBody) => resBody?.data?.id || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    const amount = req.body?.amount || 0;
    const currency = req.body?.currency || 'USD';
    const type = entity === ActivityEntity.PAYMENT ? 'Payment' : 'Refund';
    return isSuccess 
      ? `${type} of ${currency} ${amount} processed successfully`
      : `${type} processing failed`;
  },
  tags: ['payment', entity === ActivityEntity.PAYMENT ? 'transaction' : 'refund']
});
/**
 * Helper for promotion CRUD configs
 */
export const createPromotionConfig = (
  promotionType: string,
  entityNameField: string = 'name'
): IActivityConfig[] => {
  const entityName = promotionType.replace(/-/g, ' ');
  return [
    // CREATE
    {
      action: ActivityAction.CREATE,
      entity: ActivityEntity.PROMOTION,
      getEntityId: (req, resBody) => resBody?.data?.id || resBody?.data?._id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[entityNameField] || req.body?.[entityNameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = resBody?.data?.[entityNameField] || req.body?.[entityNameField] || entityName;
        return isSuccess
          ? `${entityName} promotion '${name}' created successfully`
          : `Failed to create ${entityName} promotion`;
      },
      tags: ['promotion', promotionType, 'create']
    },
    // UPDATE
    {
      action: ActivityAction.UPDATE,
      entity: ActivityEntity.PROMOTION,
      getEntityId: (req, resBody) => req.params?.id || resBody?.data?._id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[entityNameField] || req.body?.[entityNameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = resBody?.data?.[entityNameField] || req.body?.[entityNameField] || entityName;
        return isSuccess
          ? `${entityName} promotion '${name}' updated successfully`
          : `Failed to update ${entityName} promotion`;
      },
      tags: ['promotion', promotionType, 'update']
    },
    // DELETE
    {
      action: ActivityAction.DELETE,
      entity: ActivityEntity.PROMOTION,
      getEntityId: (req, resBody) => req.params?.id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[entityNameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = resBody?.data?.[entityNameField] || `deleted ${entityName}`;
        return isSuccess
          ? `${entityName} promotion '${name}' deleted successfully`
          : `Failed to delete ${entityName} promotion`;
      },
      tags: ['promotion', promotionType, 'delete']
    }
  ];
};

/**
 * Helper for toggle status configs
 */
export const createToggleStatusConfig = (
  entity: ActivityEntity,
  entityName: string
): IActivityConfig => ({
  action: ActivityAction.UPDATE,
  entity,
  getEntityId: (req, resBody) => req.params?.id || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    const status = resBody?.data?.isActive || resBody?.data?.status || 'toggled';
    return isSuccess
      ? `${entityName} status updated to '${status}'`
      : `Failed to toggle ${entityName} status`;
  },
  tags: [entityName.toLowerCase(), 'status', 'toggle', 'update']
});

/**
 * Helper for loyalty program configs
 */
export const createLoyaltyConfig = (
  subType: string,
  nameField: string = 'name'
): IActivityConfig[] => {
  const entityName = subType.replace(/-/g, ' ');
  return [
    // CREATE
    {
      action: ActivityAction.CREATE,
      entity: ActivityEntity.LOYALTY_CONFIG,
      getEntityId: (req, resBody) => resBody?.data?.id || resBody?.data?._id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[nameField] || req.body?.[nameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = resBody?.data?.[nameField] || req.body?.[nameField] || entityName;
        return isSuccess
          ? `Loyalty ${entityName} '${name}' created successfully`
          : `Failed to create loyalty ${entityName}`;
      },
      tags: ['loyalty', subType, 'create']
    },
    // UPDATE
    {
      action: ActivityAction.UPDATE,
      entity: ActivityEntity.LOYALTY_CONFIG,
      getEntityId: (req, resBody) => req.params?.id || resBody?.data?._id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[nameField] || req.body?.[nameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = resBody?.data?.[nameField] || req.body?.[nameField] || entityName;
        return isSuccess
          ? `Loyalty ${entityName} '${name}' updated successfully`
          : `Failed to update loyalty ${entityName}`;
      },
      tags: ['loyalty', subType, 'update']
    },
    // DELETE
    {
      action: ActivityAction.DELETE,
      entity: ActivityEntity.LOYALTY_CONFIG,
      getEntityId: (req, resBody) => req.params?.id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[nameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        return isSuccess
          ? `Loyalty ${entityName} deleted successfully`
          : `Failed to delete loyalty ${entityName}`;
      },
      tags: ['loyalty', subType, 'delete']
    }
  ];
};

/**
 * Helper for property sub-resource configs (address, amenity, room, etc.)
 */
export const createPropertySubResourceConfig = (
  subResource: string,
  action: ActivityAction,
  additionalTags: string[] = []
): IActivityConfig => ({
  action,
  entity: ActivityEntity.PROPERTY,
  getEntityId: (req, resBody) => req.params?.propertyId || req.params?.id || 'unknown',
  getEntityName: (req, resBody) => resBody?.data?.propertyName || req.body?.propertyName || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    const propertyName = resBody?.data?.propertyName || req.body?.propertyName || 'property';
    const actionText = action === ActivityAction.CREATE ? 'added to' : action === ActivityAction.UPDATE ? 'updated for' : 'removed from';
    return isSuccess
      ? `Property ${subResource} ${actionText} '${propertyName}'`
      : `Failed to ${action.toLowerCase()} ${subResource} for property`;
  },
  tags: ['property', subResource, action.toLowerCase(), ...additionalTags]
});

/**
 * Helper for room sub-resource configs
 */
export const createRoomSubResourceConfig = (
  subResource: string,
  action: ActivityAction
): IActivityConfig => ({
  action,
  entity: ActivityEntity.ROOM,
  getEntityId: (req, resBody) => req.params?.roomId || req.params?.id || 'unknown',
  getEntityName: (req, resBody) => resBody?.data?.roomName || req.body?.roomName || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    const roomName = resBody?.data?.roomName || req.body?.roomName || 'room';
    const actionText = action === ActivityAction.CREATE ? 'added to' : action === ActivityAction.UPDATE ? 'updated for' : 'removed from';
    return isSuccess
      ? `Room ${subResource} ${actionText} '${roomName}'`
      : `Failed to ${action.toLowerCase()} ${subResource} for room`;
  },
  tags: ['room', subResource, action.toLowerCase()]
});

/**
 * Helper for tax-related configs
 */
export const createTaxConfig = (
  taxType: string,
  nameField: string = 'name'
): IActivityConfig[] => {
  const entity = taxType.includes('group') ? ActivityEntity.TAX_GROUP : ActivityEntity.TAX_RULE;
  return [
    // CREATE
    {
      action: ActivityAction.CREATE,
      entity,
      getEntityId: (req, resBody) => resBody?.data?.id || resBody?.data?._id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[nameField] || req.body?.[nameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = resBody?.data?.[nameField] || req.body?.[nameField] || taxType;
        return isSuccess
          ? `${taxType} '${name}' created successfully`
          : `Failed to create ${taxType}`;
      },
      tags: ['tax', taxType.toLowerCase().replace(' ', '-'), 'create']
    },
    // UPDATE
    {
      action: ActivityAction.UPDATE,
      entity,
      getEntityId: (req, resBody) => req.params?.id || req.params?.[`${taxType.replace(' ', '')}Id`] || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[nameField] || req.body?.[nameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        const name = resBody?.data?.[nameField] || req.body?.[nameField] || taxType;
        return isSuccess
          ? `${taxType} '${name}' updated successfully`
          : `Failed to update ${taxType}`;
      },
      tags: ['tax', taxType.toLowerCase().replace(' ', '-'), 'update']
    },
    // DELETE
    {
      action: ActivityAction.DELETE,
      entity,
      getEntityId: (req, resBody) => req.params?.id || 'unknown',
      getEntityName: (req, resBody) => resBody?.data?.[nameField] || 'unknown',
      getDescription: (req, resBody, statusCode) => {
        const isSuccess = statusCode! >= 200 && statusCode! < 300;
        return isSuccess
          ? `${taxType} deleted successfully`
          : `Failed to delete ${taxType}`;
      },
      tags: ['tax', taxType.toLowerCase().replace(' ', '-'), 'delete']
    }
  ];
};

/**
 * Helper for management configs (category, type, amenity)
 */
export const createManagementConfig = (
  resourceType: string,
  action: ActivityAction,
  nameField: string = 'name'
): IActivityConfig => ({
  action,
  entity: ActivityEntity.PROPERTY,
  getEntityId: (req, resBody) => resBody?.data?.id || resBody?.data?._id || 'unknown',
  getEntityName: (req, resBody) => resBody?.data?.[nameField] || req.body?.[nameField] || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    const name = resBody?.data?.[nameField] || req.body?.[nameField] || resourceType;
    const actionText = action === ActivityAction.CREATE ? 'created' : action === ActivityAction.UPDATE ? 'updated' : 'deleted';
    return isSuccess
      ? `${resourceType} '${name}' ${actionText} successfully`
      : `Failed to ${action.toLowerCase()} ${resourceType}`;
  },
  tags: ['management', resourceType.toLowerCase(), action.toLowerCase()]
});

/**
 * Helper for video upload configs
 */
export const createVideoConfig = (
  targetType: 'property' | 'room',
  action: ActivityAction
): IActivityConfig => ({
  action,
  entity: targetType === 'property' ? ActivityEntity.PROPERTY : ActivityEntity.ROOM,
  getEntityId: (req, resBody) => req.params?.id || req.params?.propertyId || req.params?.roomId || 'unknown',
  getEntityName: (req, resBody) => resBody?.data?.propertyName || resBody?.data?.roomName || req.body?.name || 'unknown',
  getDescription: (req, resBody, statusCode) => {
    const isSuccess = statusCode! >= 200 && statusCode! < 300;
    const name = resBody?.data?.propertyName || resBody?.data?.roomName || targetType;
    const actionText = action === ActivityAction.CREATE ? 'uploaded' : 'deleted';
    return isSuccess
      ? `Video ${actionText} for ${targetType} '${name}'`
      : `Failed to ${action.toLowerCase()} video for ${targetType}`;
  },
  tags: ['video', targetType, action.toLowerCase()]
});