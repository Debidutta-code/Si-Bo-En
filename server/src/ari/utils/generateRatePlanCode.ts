import {prisma} from "../../config";

export default async function generateRatePlanCode() {
  const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  let code = '';
  let exists = true;

  while (exists) {
    code = generateCode();
    const existing = await prisma.ratePlan.findFirst({
      where: { ratePlanCode: code },
    });
    exists = !!existing;
  }

  return code;
}