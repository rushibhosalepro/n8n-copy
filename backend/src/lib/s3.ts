import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../config/env";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://4be3a36bce6d072b1852e95ee3cc5355.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});
