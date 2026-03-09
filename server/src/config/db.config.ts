import { PrismaClient } from "@prisma/client";
import { connect } from "mongoose";

export async function connectMongo() {
  try {

    const connection = await connect(process.env.EXTRANET_MONGO_URI as string);
    console.log(`✅ MongoDB connected successfully`);
  } catch (error) {
    console.error("❌ Error connecting mongodb:", error);
  }
}

export const prisma = new PrismaClient();

export async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma Db connected successfully");
  } catch (error) {
    console.error("❌ Error connecting Postgres:", error);
  }
}
