import dotenv from "dotenv";

dotenv.config();

export const config = {
  corsOrigin: (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim()),
  port: process.env.PORT || "3001",
  url: process.env.SERVER_URL || "http://localhost",

  accessKeyId: process.env.ACCESS_KEY_Id!,
  secretAccessKey: process.env.SECRET_ACCESS_KEY!,

  google_redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
  google_client_id: process.env.GOOGLE_CLIENT_ID!,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  jwt_secret: process.env.JWT_SECRET!,
};
