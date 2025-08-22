import crypto from "crypto";

const key = Buffer.from(process.env.BASE64_SECRET!, "base64");
const algorithm = "aes-256-cbc";

/**
 * Encrypts a string or object using AES-256-CBC algorithm.
 *
 * @param data - The data to encrypt. Objects will be stringified automatically.
 * @returns A string in the format "iv-encryptedData" where both parts are hex encoded
 *
 * @example
 * encrypt({ foo: "bar" }) // "8f5a1c...-9e2b3c..."
 */
export const encrypt = (data: any) => {
  let stringifyData = data;
  if (typeof data !== "string") {
    stringifyData = JSON.stringify(data);
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(stringifyData, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + "-" + encrypted;
};

/**
 * Decrypts an encrypted string using AES-256-CBC algorithm.
 *
 * @param encrypted - The string to decrypt in "iv-encryptedData" format
 * @param options - Optional settings
 * @param options.parse - If true, attempts to parse decrypted string as JSON
 * @returns Decrypted string or object (if parse=true). Returns null if decryption fails
 *
 * @example
 * decrypt("8f5a1c...-9e2b3c...", { parse: true }) // { foo: "bar" }
 */
export const decrypt = (encrypted?: string | null, options?: { parse?: boolean }) => {
  if (!encrypted) return "";

  const parts = encrypted.split("-");
  if (parts.length !== 2) {
    console.error("Invalid chipper format.");
    return null;
  }
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    if (options?.parse) {
      return JSON.parse(decrypted);
    }
    return decrypted;
  } catch (e) {
    console.error("Failed while decrypting:", e);
    return null;
  }
};

/**
 * Generates a random 32-byte encryption key and prints it in Base64 format.
 *
 * @example
 * generateEncryptionKey() // logs: Base 64 encoded encryption key: ...
 */
export function generateEncryptionKey() {
  const buffer = crypto.randomBytes(32);
  const encodedKey = buffer.toString("base64");
  console.log(`Base 64 encoded encryption key: ${encodedKey}`);
}
