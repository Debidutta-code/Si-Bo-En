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
