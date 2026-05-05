// Socket-related constants

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  JOIN_PAYMENT_ROOM: 'join-payment-room',
  LEAVE_PAYMENT_ROOM: 'leave-payment-room',
  ROOM_JOINED: 'room-joined',
  PAYMENT_STATUS_UPDATE: 'payment-status-update',
} as const;

export const ROOM_PREFIX = {
  PAYMENT: 'payment',
} as const;

export const DEFAULT_TRANSPORTS = ['websocket', 'polling'] as const;

export const CORS_METHODS = ['GET', 'POST'] as const;

export const SOCKET_CONFIG = {
  PING_TIMEOUT: 60000,
  PING_INTERVAL: 25000,
} as const;