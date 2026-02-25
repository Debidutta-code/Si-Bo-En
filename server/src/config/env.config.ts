import dotenv from 'dotenv';
dotenv.config();

const config={
    port: process.env.PORT ,


    mongoUrl: process.env.EXTRANET_MONGO_URI,
    postgresUrl: process.env.DATABASE_URL,

    jwtSecretKeyDev: process.env.JWT_SECRET_KEY_DEV,
    jwtSecretKeyProd: process.env.JWT_SECRET_KEY,
    jwtExpiresInDev: process.env.JWT_EXPIRES_IN_DEV,
    jwtExpiresInProd: process.env.JWT_EXPIRES_IN,

    agencyJWTSecret: process.env.AGENT_JWT_SECRET,
    agencyJWTExpiresIn: process.env.AGENT_JWT_EXPIRES_IN,

    cloudinaryUrl: process.env.CLOUDINARY_URL,

    frontendUrl: process.env.FRONTEND_URL,

    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ["*"],


    GridApiKey: process.env.SENDGRID_API_KEY,

    cloudinaryName:process.env.CLOUDINARY_NAME,
    cloudinaryKey:process.env.CLOUDINARY_KEY,
    cloudinarySecrete:process.env.CLOUDINARY_SECRETE,

    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    senderEmail:process.env.EMAIL_USER,
    senderName:process.env.SENDER_NAME,
    senderEmailPassword:process.env.EMAIL_SERVICE_PASSWORD,

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
    rateTtigerPartnerName:process.env.RATETIGER_PARTNER_NAME,
    rateTigerJwtSecret: process.env.RATETIGER_JWT_SECRET || 'your-secret-key',
    rateTigerJwtExpiresIn: 24 * 60 * 60,
    rateTigerReservationUrl: process.env.RATETIGER_RESERVATION_URL || '',
    rateTigerAuthUrl:process.env.RATETIGER_AUTHENTICATION_URL||''
}       
export default config;
