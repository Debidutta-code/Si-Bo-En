import { createClient } from 'redis';
import { config } from './';

class RedisClient {
    private static instance: ReturnType<typeof createClient>;

    public static getInstance(): ReturnType<typeof createClient> {
        if (!RedisClient.instance) {
            RedisClient.instance = RedisClient.createClient();
        }
        return RedisClient.instance;
    }

    private static createClient(): ReturnType<typeof createClient> {
        const client = createClient({
            password: config.redisPassword,
            socket: {
                host: config.redisHost,
                port: parseInt(config.redisPort || '6379'),
                connectTimeout: 30000, // 30 seconds
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('❌ Too many Redis reconnection attempts. Stopping...');
                        return new Error('Too many reconnection attempts');
                    }
                    const delay = Math.min(retries * 1000, 5000);
                    console.log(`🔄 Reconnecting to Redis in ${delay}ms... (attempt ${retries})`);
                    return delay;
                },
            },
        });

        // Event handlers
        client.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
        });

        client.on('connect', () => {
            console.log('✅ Redis client connected');
        });

        client.on('ready', () => {
            console.log('✅ Redis client ready');
        });

        client.on('reconnecting', () => {
            console.log('🔄 Redis client reconnecting...');
        });

        client.on('end', () => {
            console.log('⚠️  Redis connection closed');
        });

        return client;
    }

    public static async connect(): Promise<void> {
        const client = RedisClient.getInstance();
        if (!client.isOpen) {
            await client.connect();
            console.log('✅ Connected to Redis');
        }
    }

    public static async close(): Promise<void> {
        if (RedisClient.instance && RedisClient.instance.isOpen) {
            await RedisClient.instance.quit();
            console.log('✅ Redis connection closed gracefully');
        }
    }

    public static async testConnection(): Promise<boolean> {
        try {
            const client = RedisClient.getInstance();
            const pong = await client.ping();
            console.log('✅ Redis connection test:', pong);
            return pong === 'PONG';
        } catch (error) {
            console.error('❌ Redis connection test failed:', error);
            return false;
        }
    }
}

export default RedisClient;