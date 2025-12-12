export const AUTH_KEY = 'ttb_auth_token';
export const AUTH_EXPIRY_DAYS = 7;

// SHA-256 hash - password is never stored in plain text
export const VALID_HASH = 'c97ace4c8fef2cee8fa0f3c9f52aab18dbd4f42438afe362ffb8f75ce4c04b84';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hash function using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

// Generate a session token from the hash
export async function generateToken(hash: string): Promise<string> {
  const timestamp = Date.now().toString();
  const combined = hash + timestamp;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const token = bytesToHex(new Uint8Array(hashBuffer));
  return `${token}.${timestamp}`;
}

// Verify a stored token
export async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const [, timestamp] = token.split('.');
    if (!timestamp) return false;

    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const expiryMs = AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    // Check if token is expired
    if (now - tokenTime > expiryMs) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}


