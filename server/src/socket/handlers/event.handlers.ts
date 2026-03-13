// Socket event handlers

import { Socket } from 'socket.io';
import { ConnectionManager } from '../managers/connection.manager';
import { SOCKET_EVENTS, ROOM_PREFIX } from '../constants';
import { RoomJoinedResponse } from '../types';
import { RedisClient } from '../../config';
export class SocketEventHandlers {
    constructor(private connectionManager: ConnectionManager) {}

    /**
     * Normalize orderReference: strip any accidental 'payment:' prefix.
     * Whether the frontend sends 'payment:REF-123' or just 'REF-123',
     * we always store and track the raw orderReference.
     */
    private normalizeOrderReference(input: string): string {
        const prefix = `${ROOM_PREFIX.PAYMENT}:`;
        return input.startsWith(prefix) ? input.slice(prefix.length) : input;
    }

    /**
     * Generate room name from order reference (always from raw ref)
     */
    private getRoomName(orderReference: string): string {
        return `${ROOM_PREFIX.PAYMENT}:${orderReference}`;
    }

    /**
     * Handle join-payment-room event
     * Accepts both:
     *   - 'REF-123'           (your N-Genius flow)
     *   - 'payment:REF-123'   (her Fikafi frontend sends prefixed)
     */
    async handleJoinPaymentRoom(
        socket: Socket,
        rawInput: string
    ): Promise<void> {
        if (!rawInput) {
            console.error('❌ join-payment-room: orderReference missing');
            socket.emit('error', { message: 'Order reference is required' });
            return;
        }

        const orderReference = this.normalizeOrderReference(rawInput);
        const room = this.getRoomName(orderReference);

        await socket.join(room);

        this.connectionManager.addConnection(orderReference, socket.id);

        console.log(
            `📌 Socket ${socket.id} joined room: ${room} (orderRef: ${orderReference})`
        );

        const response: RoomJoinedResponse = {
            orderReference,
            message: 'Successfully joined payment room',
        };

        socket.emit(SOCKET_EVENTS.ROOM_JOINED, response);

        // Check if payment was already confirmed/failed while client was away
        let cachedSuccess: string | null = null;
        let cachedFailure: string | null = null;

        try {
            const redis = RedisClient.getInstance();
            const cachedSuccessRaw = await redis.get(`payment:confirmed:${orderReference}`);
            cachedSuccess = cachedSuccessRaw ? String(cachedSuccessRaw) : null;
            console.log(`🔍 Redis check - success key: payment:confirmed:${orderReference}, found:`, !!cachedSuccess);
            if (cachedSuccess) {
                const paymentData = JSON.parse(cachedSuccess);
                socket.emit('payment-status-update', {
                    orderReference,
                    eventName: 'payment-confirmed',
                    status: 'success',
                    message: 'Payment successful',
                    paymentDetails: paymentData,
                });
                // await redis.del(`payment:confirmed:${orderReference}`);
            } else {
                const cachedFailureRaw = await redis.get(`payment:failed:${orderReference}`);
                cachedFailure = cachedFailureRaw ? String(cachedFailureRaw) : null;
                console.log(`🔍 Redis check - failure key: payment:failed:${orderReference}, found:`, !!cachedFailure);
                if (cachedFailure) {
                    const failureData = JSON.parse(cachedFailure);

                    socket.emit('payment-status-update', {
                        orderReference,
                        eventName: 'payment-failed',
                        status: 'failed',
                        message: failureData.message || 'Payment failed',
                        paymentDetails: failureData,
                    });
                    // await redis.del(`payment:failed:${orderReference}`);
                }
            }
        } catch (err) {
            console.error('Redis error in join-payment-room:', err);
        }

        // Handle successful payment
        // if (cachedSuccess) {
        //     console.log(`🔑 Redis cache hit (success) for ${orderReference} - emitting immediately`);
        //     const paymentData = JSON.parse(cachedSuccess);
        //     socket.emit('payment-status-update', {
        //         orderReference,
        //         eventName: 'payment-confirmed',
        //         status: 'success',
        //         message: 'Payment successful',
        //         paymentDetails: paymentData,
        //     });
        //     return;
        // }

        // Handle failed payment
        // if (cachedFailure) {
        //     console.log(
        //         `🔑 Redis cache hit (failure) for ${orderReference} - emitting immediately`
        //     );
        //     const failureData = JSON.parse(cachedFailure);

        //     socket.emit('payment-status-update', {
        //         orderReference,
        //         eventName: 'payment-failed',
        //         status: 'failed',
        //         message: failureData.message || 'Payment failed',
        //         paymentDetails: failureData,
        //     });
        //     return;
        // }
    }

    /**
     * Handle leave-payment-room event
     */
    handleLeavePaymentRoom(socket: Socket, rawInput: string): void {
        if (!rawInput) {
            console.error('❌ leave-payment-room: orderReference missing');
            return;
        }

        const orderReference = this.normalizeOrderReference(rawInput);
        const room = this.getRoomName(orderReference);

        socket.leave(room);

        this.connectionManager.removeConnection(orderReference, socket.id);

        console.log(`📌 Socket ${socket.id} left room: ${room}`);
    }

    /**
     * Handle socket disconnect
     */
    handleDisconnect(socket: Socket, reason: string): void {
        console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
        this.connectionManager.removeSocketFromAll(socket.id);
    }

    /**
     * Handle socket errors
     */
    handleError(socket: Socket, error: Error): void {
        console.error(`❌ Socket error [${socket.id}]:`, error);
    }

    /**
     * Handle new connection
     */
    handleConnection(socket: Socket): void {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Register event listeners
        socket.on(SOCKET_EVENTS.JOIN_PAYMENT_ROOM, (rawInput: string) =>
            this.handleJoinPaymentRoom(socket, rawInput)
        );

        socket.on(SOCKET_EVENTS.LEAVE_PAYMENT_ROOM, (rawInput: string) =>
            this.handleLeavePaymentRoom(socket, rawInput)
        );

        socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) =>
            this.handleDisconnect(socket, reason)
        );

        socket.on(SOCKET_EVENTS.ERROR, (error: Error) =>
            this.handleError(socket, error)
        );
    }
}
