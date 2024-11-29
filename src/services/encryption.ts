import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const { SECRET_KEY, SECRET_IV, ENCRYPTION_METHOD } = process.env;
if (!SECRET_KEY || !SECRET_IV || !ENCRYPTION_METHOD) {
  throw new Error("SECRET_KEY, SECRET_IV, ENCRYPTION_METHOD must be defined.");
}

const key = crypto
  .createHash("sha512")
  .update(SECRET_KEY)
  .digest("hex")
  .substring(0, 32);

const encryptionIV = crypto
  .createHash("sha512")
  .update(SECRET_IV)
  .digest("hex")
  .substring(0, 16);

export function encryptData<T>(data: T) {
  const cipher = crypto.createCipheriv(ENCRYPTION_METHOD!, key, encryptionIV);
  return Buffer.from(
    cipher.update(JSON.stringify(data), "utf8", "hex") + cipher.final("hex")
  ).toString("base64");
}
