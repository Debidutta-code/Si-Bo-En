import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './config/index';
import { globalActivityLogger } from './middlewares/globalActivityLogger.middleware';
export const app = express();

app.use(
    cors({
        origin:
            config.allowedOrigins.length > 0 ? config.allowedOrigins : ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cache-Control',
            'Pragma',
            'Expires',
        ],
        credentials: true,
    })
);


app.use(express.static('public'));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.set('trust proxy', true);
app.use(globalActivityLogger);
