// Socket event handlers

import { Socket } from 'socket.io';
import { ConnectionManager } from '../managers/connection.manager';
import { SOCKET_EVENTS, ROOM_PREFIX } from '../constants';
import { RoomJoinedResponse } from '../types';

export class SocketEventHandlers {
  constructor(private connectionManager: ConnectionManager) {}

  /**
   * Generate room name from order reference
   */
  private getRoomName(orderReference: string): string {
    return `${ROOM_PREFIX.PAYMENT}:${orderReference}`;
  }

  /**
   * Handle join-payment-room event
   */
  handleJoinPaymentRoom(socket: Socket, orderReference: string): void {
    if (!orderReference) {
      console.error('❌ join-payment-room: orderReference missing');
      socket.emit('error', {
        message: 'Order reference is required',
      });
      return;
    }

    const room = this.getRoomName(orderReference);
    socket.join(room);

    this.connectionManager.addConnection(orderReference, socket.id);

    console.log(`📌 Socket ${socket.id} joined room: ${room}`);

    const response: RoomJoinedResponse = {
      orderReference,
      message: 'Successfully joined payment room',
    };

    socket.emit(SOCKET_EVENTS.ROOM_JOINED, response);
  }

  /**
   * Handle leave-payment-room event
   */
  handleLeavePaymentRoom(socket: Socket, orderReference: string): void {
    if (!orderReference) {
      console.error('❌ leave-payment-room: orderReference missing');
      return;
    }

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
      (orderReference: string) => this.handleJoinPaymentRoom(socket, orderReference)
    );

    socket.on(
      SOCKET_EVENTS.LEAVE_PAYMENT_ROOM,
      (orderReference: string) => this.handleLeavePaymentRoom(socket, orderReference)
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