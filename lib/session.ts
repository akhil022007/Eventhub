// HMAC-signed session tokens. The cookie holds "<userId>.<signature>" so the
// server can verify the userId was issued by us and reject forged/tampered
// cookies. Uses Web Crypto (crypto.subtle) so the same code runs in both the
// Node runtime (route handlers, server components) and the Edge runtime (proxy).

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to your environment (.env)."
    );
  }

  return secret;
}

function toBase64Url(bytes: ArrayBuffer) {
  let binary = "";
  const view = new Uint8Array(bytes);

  for (let i = 0; i < view.length; i++) {
    binary += String.fromCharCode(view[i]);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Produce a signed session token for the given user id:
 * "<userId>.<base64url(HMAC-SHA256(userId))>".
 */
export async function signSession(userId: string) {
  const key = await getKey();

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(userId)
  );

  return `${userId}.${toBase64Url(signature)}`;
}

/**
 * Verify a session token. Returns the userId only if the signature is valid,
 * otherwise null (missing, malformed, or tampered).
 */
export async function verifySession(token: string | undefined | null) {
  if (!token) return null;

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return null;

  const userId = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  if (!userId || !signature) return null;

  try {
    const key = await getKey();

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(userId)
    );

    return valid ? userId : null;
  } catch {
    return null;
  }
}
