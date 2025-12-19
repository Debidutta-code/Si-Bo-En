import { connect } from "mongoose";
import { PrismaClient } from "../generated/prisma";

export async function connectMongo() {
  try {

    const connection = await connect(process.env.EXTRANET_MONGO_URI as string);
    console.log(`✅ MongoDB connected at ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ Error connecting mongodb:", error);
  }
}

export const prisma = new PrismaClient();

export async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log("✅ Postgres connected with Prisma");
  } catch (error) {
    console.error("❌ Error connecting Postgres:", error);
  }
}
