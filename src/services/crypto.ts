import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import * as out from "./output.js"

const ALGORITHM = "aes-256-gcm"
const ENCRYPTED_PREFIX = "ledgit:enc:"
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex) return null
  const key = Buffer.from(hex, "hex")
  if (key.length !== 32) {
    out.warn("ENCRYPTION_KEY must be 64 hex chars (32 bytes). Encryption disabled.")
    return null
  }
  return key
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  if (!key) return plaintext

  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  const payload = Buffer.concat([iv, tag, encrypted]).toString("base64")
  return ENCRYPTED_PREFIX + payload
}

export function decrypt(data: string): { ok: true; text: string } | { ok: false; reason: string } {
  if (!data.startsWith(ENCRYPTED_PREFIX)) {
    return { ok: true, text: data }
  }

  const key = getKey()
  if (!key) {
    return { ok: false, reason: "ENCRYPTION_KEY not set. Cannot decrypt." }
  }

  try {
    const raw = Buffer.from(data.slice(ENCRYPTED_PREFIX.length), "base64")
    const iv = raw.subarray(0, IV_LENGTH)
    const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return { ok: true, text: decrypted.toString("utf8") }
  } catch {
    return { ok: false, reason: "Decryption failed. Key may be wrong or data corrupted." }
  }
}
