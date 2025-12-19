import config from './env.config';
import {connectMongo,connectPostgres} from './db.config';
import prisma from './prisma.client';


export { config, connectPostgres, connectMongo, prisma };