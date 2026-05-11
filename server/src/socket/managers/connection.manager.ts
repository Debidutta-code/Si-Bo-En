// Connection tracking and management

import { ConnectionStats } from '../types';

export class ConnectionManager {
    // orderReference -> Set of socketIds
    private activeConnections: Map<string, Set<string>> = new Map();

    /**
     * Add a socket to an order's connection set
     */
    addConnection(orderReference: string, socketId: string): void {
        if (!this.activeConnections.has(orderReference)) {
            this.activeConnections.set(orderReference, new Set());
        }
        this.activeConnections.get(orderReference)!.add(socketId);

        // console.log(`✅ Connection added: ${socketId} -> ${orderReference}`);
    }

    /**
     * Remove a socket from an order's connection set
     */
    removeConnection(orderReference: string, socketId: string): void {
        const connections = this.activeConnections.get(orderReference);
        if (connections) {
            connections.delete(socketId);
            if (connections.size === 0) {
                this.activeConnections.delete(orderReference);
                // // console.log(`🗑️ No more connections for order: ${orderReference}`);
            }
        }
    }

    /**
     * Remove a socket from all connections (on disconnect)
     */
    removeSocketFromAll(socketId: string): void {
        this.activeConnections.forEach((socketIds, orderRef) => {
            socketIds.delete(socketId);
            if (socketIds.size === 0) {
                this.activeConnections.delete(orderRef);
            }
        });
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
     * Get all active connections
     */
    getAllConnections(): Map<string, Set<string>> {
        return this.activeConnections;
    }

    /**
     * Get connection statistics
     */
    getConnectionStats(): ConnectionStats {
        let totalConnections = 0;
        this.activeConnections.forEach(socketIds => {
            totalConnections += socketIds.size;
        });

        return {
            totalConnections,
            activeOrders: this.activeConnections.size,
        };
    }

    /**
     * Get all order references with active connections
     */
    getActiveOrders(): string[] {
        return Array.from(this.activeConnections.keys());
    }

    /**
     * Clear all connections
     */
    clearAll(): void {
        this.activeConnections.clear();
        // console.log('🗑️ All connections cleared');
    }
}
