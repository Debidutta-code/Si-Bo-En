import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getActivityLogs } from '../apis/logs.api';
import type { 
  IActivityLog, 
  IActivityLogQueryParams, 
  IActivityLogResponse 
} from '../interfaces';

/**
 * React Query hook for fetching activity logs
 */
export const useActivityLogs = (
  params: IActivityLogQueryParams = {},
  enabled: boolean = true
): UseQueryResult<IActivityLogResponse, Error> => {
  return useQuery({
    queryKey: ['activityLogs', params],
    queryFn: () => getActivityLogs(params),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

/**
 * Helper function to format activity log data for display
 */
export const formatActivityLog = (log: IActivityLog) => {
  const timestamp = new Date(log.timestamp);
  
  return {
    ...log,
    formattedTimestamp: timestamp.toLocaleString(),
    formattedDate: timestamp.toLocaleDateString(),
    formattedTime: timestamp.toLocaleTimeString(),
    actorDisplay: log.userName || log.userEmail || log.userId || 'System',
    entityDisplay: log.entityName || log.entityId || 'Unknown',
    actionDisplay: log.action.charAt(0).toUpperCase() + log.action.slice(1).replace('_', ' ')
  };
};

/**
 * Helper function to get severity color
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'info':
      return 'text-blue-600 bg-blue-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    case 'critical':
      return 'text-red-900 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

/**
 * Helper function to get action badge color
 */
export const getActionColor = (action: string): string => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'update':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'delete':
    case 'soft_delete':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'restore':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'login':
    case 'logout':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    case 'export':
    case 'import':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Helper function to get entity icon
 */
export const getEntityIcon = (entity: string): string => {
  switch (entity.toLowerCase()) {
    case 'user':
      return '👤';
    case 'property':
      return '🏨';
    case 'room':
      return '🛏️';
    case 'reservation':
      return '📅';
    case 'payment':
    case 'refund':
      return '💰';
    case 'rate_plan':
      return '💵';
    case 'policy':
      return '📋';
    case 'addon':
      return '➕';
    case 'agency':
    case 'agent':
      return '🤝';
    case 'loyalty_config':
    case 'loyalty_guest':
      return '⭐';
    case 'error':
      return '❌';
    default:
      return '📝';
  }
};
