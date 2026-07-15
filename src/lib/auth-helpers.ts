/**
 * Auth helpers — password hashing (Web Crypto), OTP store, session tokens.
 * No external dependencies (no bcrypt). Works in Edge and Node runtimes.
 */

// ─── Password Hashing ───────────────────────────────────────────────

const ITERATIONS = 100_000;
const SALT_LENGTH = 16;

/** Hash a plaintext password. Returns "salt:hash" hex string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(password, salt);
  const hash = await crypto.subtle.exportKey("raw", key);
  const saltHex = Buffer.from(salt).toString("hex");
  const hashHex = Buffer.from(hash).toString("hex");
  return `${saltHex}:${hashHex}`;
}

/** Verify a plaintext password against a "salt:hash" string. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const key = await deriveKey(password, salt);
  const derived = Buffer.from(await crypto.subtle.exportKey("raw", key)).toString("hex");
  return derived === hashHex;
}

async function deriveKey(password: string, salt: Uint8Array | Buffer) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );
}

// ─── OTP Store (in-memory — swap to Redis for production) ───────────

interface OTPEntry {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OTPEntry>();

/** Generate a 6-digit OTP and store it for 5 minutes. */
export function generateAndStoreOTP(phone: string): string {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  return otp;
}

/** Verify an OTP. Returns true if valid, then deletes it. */
export function verifyOTP(phone: string, otp: string): boolean {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  if (entry.otp !== otp) return false;
  otpStore.delete(phone);
  return true;
}

// ─── Session Token ──────────────────────────────────────────────────

/** Generate a random session token (32 hex chars). */
export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Buffer.from(bytes).toString("hex");
}
