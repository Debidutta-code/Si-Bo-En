// Main Socket Manager

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ConnectionManager } from '../managers/connection.manager';
import { SocketEventHandlers } from '../handlers/event.handlers';
import { PaymentStatusUpdate, ConnectionStats } from '../types';
import {
    SOCKET_EVENTS,
    ROOM_PREFIX,
    DEFAULT_TRANSPORTS,
    CORS_METHODS,
    SOCKET_CONFIG,
} from '../constants';

class SocketManager {
    private io: SocketIOServer | null = null;
    private connectionManager: ConnectionManager;
    private eventHandlers: SocketEventHandlers;

    constructor() {
        this.connectionManager = new ConnectionManager();
        this.eventHandlers = new SocketEventHandlers(this.connectionManager);
    }

    /**
     * Initialize Socket.IO server
     */
    initialize(httpServer: HTTPServer, allowedOrigins: string[]): void {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
                methods: [...CORS_METHODS],
                credentials: true,
            },
            transports: [...DEFAULT_TRANSPORTS],
            pingTimeout: SOCKET_CONFIG.PING_TIMEOUT,
            pingInterval: SOCKET_CONFIG.PING_INTERVAL,
        });

        this.setupEventHandlers();

        console.log('✅ Socket.IO initialized');
    }

    /**
     * Setup socket event handlers
     */
    private setupEventHandlers(): void {
        if (!this.io) {
            console.error(
                '❌ Cannot setup handlers: Socket.IO not initialized'
            );
            return;
        }

        this.io.on(
            SOCKET_EVENTS.CONNECTION,
            this.eventHandlers.handleConnection.bind(this.eventHandlers)
        );
    }

    /**
     * Generate room name from order reference
     */
    private getRoomName(orderReference: string): string {
        return `${ROOM_PREFIX.PAYMENT}:${orderReference}`;
    }

    /**
     * Emit payment status update to an order room
     */
    emitPaymentUpdate(
        orderReference: string,
        update: PaymentStatusUpdate
    ): void {
        if (!this.io) {
            console.error('❌ Socket.IO not initialized');
            return;
        }

        // Normalize: guard against accidental double-prefix
        const normalizedRef = orderReference.startsWith(
            `${ROOM_PREFIX.PAYMENT}:`
        )
            ? orderReference.replace(`${ROOM_PREFIX.PAYMENT}:`, '')
            : orderReference;

        const room = this.getRoomName(normalizedRef);
        const activeClients =
            this.connectionManager.getActiveConnectionCount(normalizedRef);

        console.log(
            `📡 Emitting payment update to room: ${room} (${activeClients} clients)`
        );
        console.log(`📦 Payload:`, update);

        this.io.to(room).emit(SOCKET_EVENTS.PAYMENT_STATUS_UPDATE, update);
    }

    /**
     * Check if an order has active listeners
     */
    hasActiveListeners(orderReference: string): boolean {
        return this.connectionManager.hasActiveListeners(orderReference);
    }

    /**
     * Get active connection count for an order
     */
    getActiveConnectionCount(orderReference: string): number {
        return this.connectionManager.getActiveConnectionCount(orderReference);
    }

    /**
     * Get connection statistics
     */
    getConnectionStats(): ConnectionStats {
        return this.connectionManager.getConnectionStats();
    }

    /**
     * Get all active orders
     */
    getActiveOrders(): string[] {
        return this.connectionManager.getActiveOrders();
    }

    /**
     * Get Socket.IO instance
     */
    getIO(): SocketIOServer | null {
        return this.io;
    }

    /**
     * Get connection manager instance
     */
    getConnectionManager(): ConnectionManager {
        return this.connectionManager;
    }

    /**
     * Shutdown socket server gracefully
     */
    shutdown(): void {
        if (this.io) {
            console.log('🔌 Shutting down Socket.IO server...');
            this.io.close();
            this.connectionManager.clearAll();
            this.io = null;
            console.log('✅ Socket.IO server shut down');
        }
    }
}

export const socketManager = new SocketManager();
