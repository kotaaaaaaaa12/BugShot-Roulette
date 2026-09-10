/// <reference types="@cloudflare/workers-types" />

import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  GAME_SERVER: DurableObjectNamespace<GameServer>;
  ASSETS: Fetcher;
  DB: D1Database;
  ALLOWED_ORIGINS: string;
}

interface StoredUser {
  id: number;
  username: string;
  password_hash: string;
  password_salt: string;
  stats_json: string;
  is_developer: number;
}

const EMPTY_STATS = {
  wins: 0,
  losses: 0,
  totalRounds: 0,
  shotsFired: 0,
  shotsHit: 0,
  selfShots: 0,
  damageDealt: 0,
  itemsUsed: 0,
  highestRound: 0,
  matchHistory: [],
};

const encoder = new TextEncoder();
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

async function derivePassword(password: string, salt: Uint8Array): Promise<string> {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as unknown as BufferSource,
      iterations: 210_000,
    },
    material,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function cleanUsername(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validUsername(username: string): boolean {
  return /^[a-z0-9_-]{1,12}$/.test(username);
}

function publicUser(user: StoredUser) {
  let stats = EMPTY_STATS;
  try {
    stats = { ...EMPTY_STATS, ...JSON.parse(user.stats_json || "{}") };
  } catch {
    stats = EMPTY_STATS;
  }
  return {
    username: user.username,
    stats,
    isDeveloper: user.is_developer === 1,
  };
}

async function createSession(db: D1Database, userId: number): Promise<string> {
  const rawToken = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToBase64(rawToken)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  const now = Date.now();
  const tokenHash = await sha256(token);

  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now),
    db.prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    ).bind(tokenHash, userId, now + SESSION_LIFETIME_MS, now),
  ]);

  return token;
}

async function authenticatedUser(request: Request, db: D1Database): Promise<StoredUser | null> {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  if (!token) return null;

  const tokenHash = await sha256(token);
  return db.prepare(
    `SELECT users.id, users.username, users.password_hash, users.password_salt,
            users.stats_json, users.is_developer
       FROM sessions
       JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
  ).bind(tokenHash, Date.now()).first<StoredUser>();
}

async function parseBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

async function register(request: Request, env: Env): Promise<Response> {
  const body = await parseBody(request);
  const username = cleanUsername(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!validUsername(username)) {
    return json({ success: false, error: "Username must use 1-12 letters, numbers, _ or -" }, 400);
  }
  if (password.length < 6 || password.length > 20) {
    return json({ success: false, error: "Password must be 6-20 characters" }, 400);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE username = ?")
    .bind(username)
    .first();
  if (existing) return json({ success: false, error: "Username already exists" }, 409);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await derivePassword(password, salt);
  const now = Date.now();

  try {
    const result = await env.DB.prepare(
      `INSERT INTO users
        (username, password_hash, password_salt, stats_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(
      username,
      passwordHash,
      bytesToBase64(salt),
      JSON.stringify(EMPTY_STATS),
      now,
      now,
    ).run();

    const userId = Number(result.meta.last_row_id);
    const token = await createSession(env.DB, userId);
    const user = await env.DB.prepare(
      "SELECT id, username, password_hash, password_salt, stats_json, is_developer FROM users WHERE id = ?",
    ).bind(userId).first<StoredUser>();

    return json({ success: true, user: publicUser(user!), token }, 201);
  } catch (error) {
    console.error("D1 registration failed", error);
    return json({ success: false, error: "Registration failed" }, 500);
  }
}

async function login(request: Request, env: Env): Promise<Response> {
  const body = await parseBody(request);
  const username = cleanUsername(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password) {
    return json({ success: false, error: "Username and password required" }, 400);
  }

  const user = await env.DB.prepare(
    "SELECT id, username, password_hash, password_salt, stats_json, is_developer FROM users WHERE username = ?",
  ).bind(username).first<StoredUser>();
  if (!user) return json({ success: false, error: "Username not found" }, 404);

  const candidate = await derivePassword(password, base64ToBytes(user.password_salt));
  if (!safeEqual(candidate, user.password_hash)) {
    return json({ success: false, error: "Invalid password" }, 401);
  }

  const token = await createSession(env.DB, user.id);
  return json({ success: true, user: publicUser(user), token });
}

async function getStats(request: Request, env: Env): Promise<Response> {
  const user = await authenticatedUser(request, env.DB);
  if (!user) return json({ error: "Unauthorized" }, 401);
  return json({ stats: publicUser(user).stats });
}

async function saveStats(request: Request, env: Env): Promise<Response> {
  const user = await authenticatedUser(request, env.DB);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const body = await parseBody(request);
  if (!body?.stats || typeof body.stats !== "object" || Array.isArray(body.stats)) {
    return json({ error: "Invalid stats" }, 400);
  }

  const serialized = JSON.stringify(body.stats);
  if (serialized.length > 100_000) return json({ error: "Stats payload too large" }, 413);

  await env.DB.prepare("UPDATE users SET stats_json = ?, updated_at = ? WHERE id = ?")
    .bind(serialized, Date.now(), user.id)
    .run();
  return json({ success: true });
}

async function leaderboard(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    "SELECT username, stats_json, is_developer FROM users ORDER BY updated_at DESC LIMIT 500",
  ).all<{ username: string; stats_json: string; is_developer: number }>();

  const entries = result.results.map((row) => {
    let stats: typeof EMPTY_STATS = EMPTY_STATS;
    try {
      stats = { ...EMPTY_STATS, ...JSON.parse(row.stats_json || "{}") };
    } catch {
      stats = EMPTY_STATS;
    }
    const history = Array.isArray(stats.matchHistory) ? stats.matchHistory : [];
    const hardModeWins = history.filter(
      (match: any) => match?.result === "WIN" && match?.isHardMode,
    ).length;
    return {
      username: row.username,
      wins: Number(stats.wins) || 0,
      losses: Number(stats.losses) || 0,
      hardModeWins,
      isDeveloper: row.is_developer === 1,
      stats,
    };
  });

  entries.sort((a, b) =>
    b.hardModeWins - a.hardModeWins ||
    b.wins - a.wins ||
    a.losses - b.losses,
  );
  return json(entries.slice(0, 100));
}

async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });

  try {
    if (url.pathname === "/api/register" && request.method === "POST") return register(request, env);
    if (url.pathname === "/api/login" && request.method === "POST") return login(request, env);
    if (url.pathname === "/api/stats" && request.method === "GET") return getStats(request, env);
    if (url.pathname === "/api/stats" && request.method === "PUT") return saveStats(request, env);
    if (url.pathname === "/api/leaderboard" && request.method === "GET") return leaderboard(env);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("D1 API failure", error);
    const message = error instanceof Error && error.message.includes("no such table")
      ? "D1 schema is not installed. Run schema.sql in the D1 Console."
      : "Database request failed";
    return json({ error: message }, 503);
  }
}

export class GameServer extends Container<Env> {
  defaultPort = 3001;
  sleepAfter = "10m";
  envVars = {
    PORT: "3001",
    NODE_ENV: "production",
    ALLOWED_ORIGINS: this.env.ALLOWED_ORIGINS,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    if (pathname.startsWith("/api/")) return api(request, env);

    if (
      pathname === "/health" ||
      pathname === "/server" ||
      pathname.startsWith("/server/") ||
      pathname === "/socket.io" ||
      pathname.startsWith("/socket.io/")
    ) {
      return getContainer(env.GAME_SERVER, "global-game-server-v1").fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
