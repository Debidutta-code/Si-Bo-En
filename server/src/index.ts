import {config} from './config/index';
import { app } from './app';
import { initializeExpressRoutes } from './config/route.config';
import { connectPostgres, connectMongo } from './config/index';
initializeExpressRoutes({ app }).then(async () => {
  try {
    await connectMongo();
    await connectPostgres();


    app.listen(config.port, () => {
      console.log(`🏡 Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
});
