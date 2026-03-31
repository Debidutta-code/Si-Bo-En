import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../config";

export const s3 = new S3Client({
  region: config.awsRegion!,
  credentials: {
    accessKeyId: config.awsAccessKey!,
    secretAccessKey: config.awsSecretAccessKey!,
  },
});