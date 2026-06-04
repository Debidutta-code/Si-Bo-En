import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT,

    mongoUrl: process.env.EXTRANET_MONGO_URI,
    postgresUrl: process.env.DATABASE_URL,

    jwtSecretKeyDev: process.env.JWT_SECRET_KEY_DEV,
    jwtSecretKeyProd: process.env.JWT_SECRET_KEY,
    jwtExpiresInDev: process.env.JWT_EXPIRES_IN_DEV,
    jwtExpiresInProd: process.env.JWT_EXPIRES_IN,

    agencyJWTSecret: process.env.AGENT_JWT_SECRET,
    agencyJWTExpiresIn: process.env.AGENT_JWT_EXPIRES_IN,

    customerJWTSecret: process.env.CUSTOMER_GUEST_JWT_SECRETE,
    customerJWTExpiresIn: process.env.CUSTOMER_GUEST_JWT_EXPIRES,

    otaJWTSecret: process.env.OTA_GUEST_JWT_SECRET,
    otaJWTExpiresIn: process.env.OTA_GUEST_JWT_EXPIRES,

    frontendUrl: process.env.FRONTEND_URL,
    bookingEngineUrl: process.env.BOOKING_ENGINE_URL,

    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['*'],

    GridApiKey: process.env.SENDGRID_API_KEY,

    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryKey: process.env.CLOUDINARY_KEY,
    cloudinarySecrete: process.env.CLOUDINARY_SECRETE,

    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    senderEmail: process.env.EMAIL_USER,
    senderName: process.env.SENDER_NAME,
    senderEmailPassword: process.env.EMAIL_SERVICE_PASSWORD,

    // Fikafi Payment Configuration
    fikafiBaseUrl: process.env.FIKAFI_BASE_URL,
    fikafiClientID: process.env.FIKAFI_CLIENT_ID,
    fikafiSecretKey: process.env.FIKAFI_SECRET_KEY,

    // N-Genius Payment Configuration
    ngenius: {
        baseUrl: process.env.NGENIUS_BASE_URL,
        apiKey: process.env.NGENIUS_API_KEY,
        outletId: process.env.NGENIUS_OUTLET_ID,
    },

    rateTigerUsername: process.env.RATETIGER_USERNAME,
    rateTigerPassword: process.env.RATETIGER_PASSWORD,
    rateTigerApiKey: process.env.RATETIGER_API_KEY,
    rateTigerPartnerId: process.env.RATETIGER_PARTNER_ID,
    rateTtigerPartnerName: process.env.RATETIGER_PARTNER_NAME,
    rateTigerJwtSecret: process.env.RATETIGER_JWT_SECRET || 'your-secret-key',
    rateTigerJwtExpiresIn: 24 * 60 * 60,
    rateTigerReservationUrl: process.env.RATETIGER_RESERVATION_URL || '',
    rateTigerAuthUrl: process.env.RATETIGER_AUTHENTICATION_URL || '',
    siteMinderUsername: process.env.SITE_MINDER_USERNAME,
    siteMinderPassword: process.env.SITE_MINDER_PASSWORD,
    siteMinderReservationUserName: process.env.SITE_MINDER_RESERVATION_USERNAME,
    siteMinderReservationPassword: process.env.SITE_MINDER_RESERVATION_PASSWORD,
    //currency exchange api url;
    exchangeApiUrl: process.env.EXCHANGE_API_URL || '',
    //redis config
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: process.env.REDIS_PORT || '6379',
    redisPassword: process.env.REDIS_PASSWORD || '',

    emailQueue: process.env.EMAIL_QUEUE || 'email-send-queue',
    deadLetterQueue: process.env.DEAD_LETTER_QUEUE || 'email-dead-queue',
    siteMinderAriQueue: process.env.SITEMINDER_ARI_QUEUE || 'siteminder-ari',
    siteMinderDeadLetterQueue: process.env.SITEMINDER_DEAD_LETTER_QUEUE || 'siteminder-ari-dead-letter',
    currencyExchangeQueue:
        process.env.CURRENCY_EXCHANGE_QUEUE || 'currency-exchange-queue',

    //s3 bucket config
    awsRegion: process.env.AWS_REGION!,
    awsAccessKey: process.env.AWS_ACCESS_KEY!,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    awsBucketName: process.env.AWS_BUCKET_NAME!,
    bookingengineUrl: process.env.BOOKING_ENGINE_URL,
};
export default config;
