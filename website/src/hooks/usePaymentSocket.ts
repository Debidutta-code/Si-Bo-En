"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface PaymentStatusUpdate {
  orderReference: string;
  eventName: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  eventId?: string;
  paymentDetails?: any;
}

interface UsePaymentSocketProps {
  orderReference: string | null;
  onStatusUpdate: (update: PaymentStatusUpdate) => void;
  enabled?: boolean;
}

export const usePaymentSocket = ({
  orderReference,
  onStatusUpdate,
  enabled = true,
}: UsePaymentSocketProps) => {
  const socketRef = useRef<typeof Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !orderReference) {
      return;
    }

    //console.log('🔌 Initializing Socket.IO connection...');
    //console.log('📦 Order Reference:', orderReference);

    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      //console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);

      // Join payment room with correct format matching server's payment:{orderReference}
      const roomName = `payment:${orderReference}`;
      socket.emit('join-payment-room', roomName);
      console.log(`📌 Joining payment room: ${roomName}`);
    });

    socket.on('disconnect', (reason: any) => {
      //console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('room-joined', (data: any) => {
      //console.log('✅ Joined payment room:', data);
    });

    // Listen for payment status updates
    socket.on('payment-status-update', (update: PaymentStatusUpdate) => {
      //console.log('📡 Received payment status update:', update);
      onStatusUpdate(update);
    });

    // Cleanup on unmount
    return () => {
      //console.log('🧹 Cleaning up socket connection...');
      if (socket.connected) {
        socket.emit('leave-payment-room', orderReference);
        socket.disconnect();
      }
    };
  }, [orderReference, enabled, onStatusUpdate]);

  // Manual disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return {
    isConnected,
    connectionError,
    disconnect,
  };
};