import pg from "pg";
import crypto from "crypto";

const DEFAULT_DATABASE_URL =
  "postgresql://postgres.xokhrpcqmczyaeaoibkx:@0971642189Khang@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __po3nhub_pg_pool: pg.Pool | undefined;
  // eslint-disable-next-line no-var
  var __po3nhub_admin_ensured: boolean | undefined;
}

export function getDbPool(): pg.Pool {
  if (!globalThis.__po3nhub_pg_pool) {
    globalThis.__po3nhub_pg_pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalThis.__po3nhub_pg_pool;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash) return false;
  // If plain text match (fallback for older accounts)
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return password === storedHash;

  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export const MASTER_ADMIN = {
  id: "usr_admin_khang",
  email: "buitan.khang.189@gmail.com",
  name: "Bùi Tấn Khang",
  password: "0971642189",
  role: "admin",
  status: "active",
};

export async function ensureMasterAdmin(): Promise<void> {
  if (globalThis.__po3nhub_admin_ensured) return;

  const pool = getDbPool();
  try {
    const existing = await pool.query(
      `SELECT id, role, status FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [MASTER_ADMIN.email]
    );

    if (existing.rows.length === 0) {
      const hash = hashPassword(MASTER_ADMIN.password);
      await pool.query(
        `INSERT INTO "User" (id, email, name, "passwordHash", role, status, "lastLogin", "plainPassword", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 'Vừa xong', $7, NOW(), NOW())`,
        [
          MASTER_ADMIN.id,
          MASTER_ADMIN.email.toLowerCase(),
          MASTER_ADMIN.name,
          hash,
          "admin",
          "active",
          MASTER_ADMIN.password,
        ]
      );
    } else {
      // Ensure master admin has admin role and is active
      const row = existing.rows[0];
      if (row.role !== "admin" || row.status !== "active") {
        await pool.query(
          `UPDATE "User" SET role = 'admin', status = 'active', "updatedAt" = NOW() WHERE id = $1`,
          [row.id]
        );
      }
    }
    globalThis.__po3nhub_admin_ensured = true;
  } catch (error) {
    console.error("Failed to ensure master admin account:", error);
  }
}

export function generateToken(payload: { id: string; email: string }): string {
  const secret = process.env.AUTH_SECRET || "po3nhub-secret-jwt-key-2026";
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyToken(token?: string | null): { id: string; email: string } | null {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const secret = process.env.AUTH_SECRET || "po3nhub-secret-jwt-key-2026";
  const expectedSig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (signature !== expectedSig) return null;

  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (data.exp && data.exp < Date.now()) return null;
    return { id: data.id, email: data.email };
  } catch {
    return null;
  }
}
