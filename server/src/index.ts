import { config, RedisClient } from './config';
import { app } from './app';
import { initializeExpressRoutes } from './config/route.config';
import { connectPostgres, connectMongo } from './config/index';
import { createServer } from 'http';
import { socketManager } from './socket';
import { CurrencyQueue, EmailQueue } from './queue';

const httpServer = createServer(app);

const connection = {
    host: config.redisHost,
    port: parseInt(config.redisPort || '6379'),
    password: config.redisPassword,
    maxRetriesPerRequest: null,
    connectTimeout: 30000,
    retryStrategy: (times: number) => Math.min(times * 1000, 5000),
};

export const currencyQueue = new CurrencyQueue(connection);
export const emailQueue = new EmailQueue(connection);
app.use((req: any, res, next) => {
    console.log("\n================ REQUEST START ================");
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    console.log("ORIGIN:", req.headers["origin"]);
    console.log("HEADERS:", req.headers);

    console.log("RAW BODY:");
    console.log(req.rawBody);

    console.log("PARSED BODY:");
    console.log(req.body);

    console.log("================ REQUEST END =================\n");

    next();
});
initializeExpressRoutes({ app }).then(async () => {
    try {
        await connectMongo();
        await connectPostgres();
        await RedisClient.connect();

        // Init BullMQ after Redis is ready
        await currencyQueue.setupDailyCurrencyFetch();

        socketManager.initialize(httpServer, config.allowedOrigins);

        httpServer.listen(config.port, () => {
            console.log(`🏡 Server is running on port ${config.port}`);
        });
    } catch (err) {
        console.log(`Error while initializing server: ${err}`);
    }
});

// Graceful shutdown
const shutdown = async () => {
    console.log('⚠️  Shutting down...');
    await currencyQueue.close();
    await emailQueue.close();
    await RedisClient.close();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
