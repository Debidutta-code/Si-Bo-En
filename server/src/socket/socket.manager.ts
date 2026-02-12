// Socket Manager for Real-time Payment Updates
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export interface PaymentStatusUpdate {
  orderReference: string;
  eventName: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  eventId?: string;
  paymentDetails?: any;
}

class SocketManager {
  private io: SocketIOServer | null = null;

  // orderReference -> Set of socketIds
  private activeConnections: Map<string, Set<string>> = new Map();

  /**
   * Initialize Socket.IO server (DEFAULT NAMESPACE ONLY)
   */
  initialize(httpServer: HTTPServer, allowedOrigins: string[]): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();

    console.log('✅ Socket.IO initialized (default namespace)');
  }

  /**
   * Setup socket event handlers (NO NAMESPACE)
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      /**
       * Join payment room
       * Handles both formats:
       * - Legacy: receives just {orderReference} → creates room payment:{orderReference}
       * - New: receives {payment:{orderReference}} → joins room as-is
       */
      socket.on('join-payment-room', (roomIdentifier: string) => {
        if (!roomIdentifier) {
          console.error('❌ join-payment-room: roomIdentifier missing');
          return;
        }

        // Detect if already has payment: prefix (new format from frontend)
        let room: string;
        let orderReference: string;

        if (roomIdentifier.startsWith('payment:')) {
          // New format: frontend sends full room name
          room = roomIdentifier;
          orderReference = roomIdentifier.replace('payment:', '');
          console.log(`📌 Using new format room name: ${room}`);
        } else {
          // Legacy format: frontend sends just orderReference
          room = `payment:${roomIdentifier}`;
          orderReference = roomIdentifier;
          console.log(`📌 Using legacy format, created room: ${room}`);
        }

        socket.join(room);

        // Track by actual orderReference (without prefix)
        if (!this.activeConnections.has(orderReference)) {
          this.activeConnections.set(orderReference, new Set());
        }
        this.activeConnections.get(orderReference)!.add(socket.id);

        console.log(`📌 Socket ${socket.id} joined room: ${room} (orderRef: ${orderReference})`);

        socket.emit('room-joined', {
          orderReference,
          room,
          message: 'Successfully joined payment room',
        });
      });

      /**
       * Leave payment room
       */
      socket.on('leave-payment-room', (orderReference: string) => {
        const room = `payment:${orderReference}`;
        socket.leave(room);
        this.activeConnections.get(orderReference)?.delete(socket.id);

        console.log(`📌 Socket ${socket.id} left room: ${room}`);
      });

      /**
       * Handle disconnect
       */
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);

        this.activeConnections.forEach((socketIds, orderRef) => {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            this.activeConnections.delete(orderRef);
          }
        });
      });

      /**
       * Handle socket errors
       */
      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    });
  }

  /**
   * Emit payment status update to an order room
   */
  emitPaymentUpdate(orderReference: string, update: PaymentStatusUpdate): void {
    if (!this.io) {
      console.error('❌ Socket.IO not initialized');
      return;
    }

    const room = `payment:${orderReference}`;
    const activeClients = this.activeConnections.get(orderReference)?.size || 0;

    console.log(`📡 Emitting payment update`);
    console.log(`➡️ Room: ${room}`);
    console.log(`👥 Active clients: ${activeClients}`);
    console.log(`📦 Payload:`, update);

    this.io.to(room).emit('payment-status-update', update);
  }

  /**
   * Check if an order has active listeners
   */
  hasActiveListeners(orderReference: string): boolean {
    return (this.activeConnections.get(orderReference)?.size || 0) > 0;
  }

  /**
   * Get active connection count for an order
   */
  getActiveConnectionCount(orderReference: string): number {
    return this.activeConnections.get(orderReference)?.size || 0;
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketManager = new SocketManager();
