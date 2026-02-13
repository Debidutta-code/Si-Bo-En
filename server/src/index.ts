import { config } from './config/index';
import { app } from './app';
import { initializeExpressRoutes } from './config/route.config';
import { connectPostgres, connectMongo } from './config/index';
import { createServer } from 'http';
import { socketManager } from './socket';

// Create HTTP server
const httpServer = createServer(app);

initializeExpressRoutes({ app }).then(async () => {
  try {
    await connectMongo();
    await connectPostgres();

    // Initialize Socket.IO
    socketManager.initialize(httpServer, config.allowedOrigins);

    // Start server
    httpServer.listen(config.port, () => {
      // console.log(`🏡 Server is running on port ${config.port}`);
      // console.log(`🔌 Socket.IO is ready for connections`);
    });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
});
