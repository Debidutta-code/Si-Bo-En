// Socket Manager for Real-time Payment Updates
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface PaymentStatusUpdate {
  orderReference: string;
  eventName: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  eventId?: string;
  paymentDetails?: any;
}

class SocketManager {
  private io: SocketIOServer | null = null;
  private activeConnections: Map<string, Set<string>> = new Map(); // orderRef -> Set of socketIds

  /**
   * Initialize Socket.IO server
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
    console.log('✅ Socket.IO initialized successfully');
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Join payment room
      socket.on('join-payment-room', (orderReference: string) => {
        if (!orderReference) {
          console.error('❌ No order reference provided');
          return;
        }

        socket.join(`payment:${orderReference}`);
        
        // Track this connection
        if (!this.activeConnections.has(orderReference)) {
          this.activeConnections.set(orderReference, new Set());
        }
        this.activeConnections.get(orderReference)?.add(socket.id);

        console.log(`📌 Client ${socket.id} joined room: payment:${orderReference}`);
        
        // Acknowledge joining
        socket.emit('room-joined', {
          orderReference,
          message: 'Successfully joined payment room',
        });
      });

      // Leave payment room
      socket.on('leave-payment-room', (orderReference: string) => {
        socket.leave(`payment:${orderReference}`);
        this.activeConnections.get(orderReference)?.delete(socket.id);
        console.log(`📌 Client ${socket.id} left room: payment:${orderReference}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        
        // Remove from all rooms
        this.activeConnections.forEach((socketIds, orderRef) => {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            this.activeConnections.delete(orderRef);
          }
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    });
  }

  /**
   * Send payment status update to specific order room
   */
  emitPaymentUpdate(orderReference: string, update: PaymentStatusUpdate): void {
    if (!this.io) {
      console.error('❌ Socket.IO not initialized');
      return;
    }

    const room = `payment:${orderReference}`;
    const activeClients = this.activeConnections.get(orderReference);

    console.log(`📡 Emitting payment update to room: ${room}`);
    console.log(`👥 Active clients in room: ${activeClients?.size || 0}`);
    console.log(`📦 Update data:`, update);

    this.io.to(room).emit('payment-status-update', update);
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Check if there are active listeners for an order
   */
  hasActiveListeners(orderReference: string): boolean {
    const listeners = this.activeConnections.get(orderReference);
    return listeners ? listeners.size > 0 : false;
  }

  /**
   * Get number of active connections for an order
   */
  getActiveConnectionCount(orderReference: string): number {
    return this.activeConnections.get(orderReference)?.size || 0;
  }
}

export const socketManager = new SocketManager();