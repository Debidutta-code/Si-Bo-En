import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import {config} from "./config/index"
import { globalActivityLogger } from './middlewares/globalActivityLogger.middleware';
export const app = express();

app.use(
  cors({
    origin:
      config.allowedOrigins.length > 0
        ? config.allowedOrigins
        : ['*'],
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

// Increase the payload size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
  })
);
app.use(globalActivityLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.set('trust proxy', true);

// ✅ Mock Fikafi Payment Endpoint for Testing
app.post('/createPayment', (req, res) => {
    console.log('📥 Mock Fikafi received payment request:', JSON.stringify(req.body, null, 2));
    
    const bookingRefNum = req.body.bookingRefNum || 'MOCK-' + Date.now();
    
    // ✅ MOCK MODE: Return success URL that redirects to our success page
    const successUrl = `http://localhost:8080/api/v1/fikafi/mock-success?bookingRefNum=${bookingRefNum}`;
    
    res.json({
        success: true,
        data: {
            paymentLink: successUrl,
            paymentId: bookingRefNum,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            bookingRefNum: bookingRefNum
        }
    });
});

// ✅ Mock Success Redirect Endpoint - simulates Fikafi redirect after payment
app.get('/api/v1/fikafi/mock-success', (req, res) => {
    const { bookingRefNum } = req.query;
    
    console.log('📥 Mock Fikafi redirect received:', { bookingRefNum });
    
    // Redirect to the frontend success page
    res.redirect(`http://localhost:3000/PaymentSuccess?bookingCode=${bookingRefNum}`);
});
