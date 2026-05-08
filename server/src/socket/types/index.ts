// Socket-related type definitions

export interface PaymentStatusUpdate {
    orderReference: string;
    eventName: string;
    status: 'success' | 'failed' | 'pending';
    message: string;
    eventId?: string;
    paymentDetails?: any;
}

export interface RoomJoinedResponse {
    orderReference: string;
    message: string;
}

export interface SocketConfig {
    allowedOrigins: string[];
    transports?: ('websocket' | 'polling')[];
}

export interface ConnectionStats {
    totalConnections: number;
    activeOrders: number;
}
