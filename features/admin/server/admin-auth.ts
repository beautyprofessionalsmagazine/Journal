import "server-only";

import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "journal_admin_session";
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

async function sign(value: string, password: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );

  return Array.from(signature, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function verifyAdminPassword(candidate: string) {
  const password = getAdminPassword();

  if (!password) {
    return false;
  }

  const [candidateDigest, passwordDigest] = await Promise.all([
    digest(candidate),
    digest(password),
  ]);
  let difference = 0;

  for (let index = 0; index < passwordDigest.length; index += 1) {
    difference |= candidateDigest[index] ^ passwordDigest[index];
  }

  return difference === 0;
}

export async function createAdminSession() {
  const password = getAdminPassword();

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_DURATION_SECONDS;
  const signature = await sign(String(expiresAt), password);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, `${expiresAt}.${signature}`, {
    httpOnly: true,
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifyAdminSessionToken(token);
}

export async function verifyAdminSessionToken(token: string | undefined) {
  const password = getAdminPassword();

  if (!password || !token) {
    return false;
  }

  const [expiresAtValue, suppliedSignature, ...extraParts] = token.split(".");
  const expiresAt = Number(expiresAtValue);

  if (
    extraParts.length > 0 ||
    !expiresAtValue ||
    !suppliedSignature ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const expectedSignature = await sign(expiresAtValue, password);
  const [suppliedDigest, expectedDigest] = await Promise.all([
    digest(suppliedSignature),
    digest(expectedSignature),
  ]);
  let difference = 0;

  for (let index = 0; index < expectedDigest.length; index += 1) {
    difference |= suppliedDigest[index] ^ expectedDigest[index];
  }

  return difference === 0;
}

export { ADMIN_SESSION_COOKIE };
