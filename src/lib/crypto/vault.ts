const keyCache = new Map<string, Promise<CryptoKey>>();

export function bytesToB64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function b64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function newSalt(): string {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(16)));
}

async function deriveVaultKey(userId: string, email: string, saltB64: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`boa-portaal-v1|${userId}|${email.trim().toLowerCase()}`),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toBuffer(b64ToBytes(saltB64)),
      iterations: 120000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function vaultKey(userId: string, email: string, saltB64: string): Promise<CryptoKey> {
  const cacheId = `${userId}|${email.trim().toLowerCase()}|${saltB64}`;
  let pending = keyCache.get(cacheId);
  if (!pending) {
    pending = deriveVaultKey(userId, email, saltB64);
    keyCache.set(cacheId, pending);
  }
  return pending;
}

export async function encryptString(key: CryptoKey, plain: string): Promise<{ iv: string; cipher: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toBuffer(iv) },
    key,
    new TextEncoder().encode(plain),
  );
  return { iv: bytesToB64(iv), cipher: bytesToB64(new Uint8Array(cipherBuf)) };
}

export async function decryptString(key: CryptoKey, ivB64: string, cipherB64: string): Promise<string> {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toBuffer(b64ToBytes(ivB64)) },
    key,
    toBuffer(b64ToBytes(cipherB64)),
  );
  return new TextDecoder().decode(plain);
}
