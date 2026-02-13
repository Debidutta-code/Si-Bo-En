// Socket event handlers

import { Socket } from 'socket.io';
import { ConnectionManager } from '../managers/connection.manager';
import { SOCKET_EVENTS, ROOM_PREFIX } from '../constants';
import { RoomJoinedResponse } from '../types';

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
  handleJoinPaymentRoom(socket: Socket, rawInput: string): void {
    if (!rawInput) {
      console.error('❌ join-payment-room: orderReference missing');
      socket.emit('error', { message: 'Order reference is required' });
      return;
    }

    const orderReference = this.normalizeOrderReference(rawInput);
    const room = this.getRoomName(orderReference);

    socket.join(room);

    this.connectionManager.addConnection(orderReference, socket.id);

    console.log(`📌 Socket ${socket.id} joined room: ${room} (orderRef: ${orderReference})`);

    const response: RoomJoinedResponse = {
      orderReference,
      message: 'Successfully joined payment room',
    };

    socket.emit(SOCKET_EVENTS.ROOM_JOINED, response);
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
    socket.on(
      SOCKET_EVENTS.JOIN_PAYMENT_ROOM,
      (rawInput: string) => this.handleJoinPaymentRoom(socket, rawInput)
    );

    socket.on(
      SOCKET_EVENTS.LEAVE_PAYMENT_ROOM,
      (rawInput: string) => this.handleLeavePaymentRoom(socket, rawInput)
    );

    socket.on(
      SOCKET_EVENTS.DISCONNECT,
      (reason: string) => this.handleDisconnect(socket, reason)
    );

    socket.on(
      SOCKET_EVENTS.ERROR,
      (error: Error) => this.handleError(socket, error)
    );
  }
}