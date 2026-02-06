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
    cloudinaryUrl: process.env.CLOUDINARY_URL,

    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ["*"],


    GridApiKey: process.env.SENDGRID_API_KEY,

    cloudinaryName:process.env.CLOUDINARY_NAME,
    cloudinaryKey:process.env.CLOUDINARY_KEY,
    cloudinarySecrete:process.env.CLOUDINARY_SECRETE,

    senderEmail:process.env.EMAIL_USER,
    senderName:process.env.SENDER_NAME,
    senderEmailPassword:process.env.EMAIL_SERVICE_PASSWORD,

    // Fikafi Payment Configuration
    fikafiBaseUrl: process.env.FIKAFI_BASE_URL,
    fikafiClientID: process.env.FIKAFI_CLIENT_ID,
    fikafiSecretKey: process.env.FIKAFI_SECRET_KEY,
}       
export default config;
