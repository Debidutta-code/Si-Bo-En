import { connect } from "mongoose";
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "./env.config";

export async function connectMongo() {
  try {

    const connection = await connect(process.env.EXTRANET_MONGO_URI as string);
    console.log(`✅ MongoDB connected successfully`);
  } catch (error) {
    console.error("❌ Error connecting mongodb:", error);
  }
}
const postgresUrl = config.postgresUrl;
if (!postgresUrl) {
  throw new Error("DATABASE_URL is required to initialize PrismaClient");
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: postgresUrl }),
});

export async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma Db connected successfully");
  } catch (error) {
    console.error("❌ Error connecting Postgres:", error);
  }
}
