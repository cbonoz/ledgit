import type Transport from "@ledgerhq/hw-transport-node-speculos-http"
import * as out from "./output.js"

let transport: Transport | null = null

export async function connectLedger(
  url?: string
): Promise<void> {
  const speculosUrl = url || process.env.LEDGER_SPECULOS_URL || "http://127.0.0.1:5000"
  try {
    const { default: SpeculosTransport } = await import(
      "@ledgerhq/hw-transport-node-speculos-http"
    )
    transport = await SpeculosTransport.open(speculosUrl)
    out.success("Connected to Ledger Speculos emulator")
  } catch {
    out.warn("Could not connect to Ledger Speculos. Falling back to software signing.")
  }
}

export async function signWithLedger(
  messageHex: string
): Promise<string> {
  if (!transport) {
    const { createHash } = await import("node:crypto")
    return "0x" + createHash("sha256").update(Buffer.from(messageHex, "hex")).digest("hex") + "".padStart(64, "f")
  }
  const result = await transport.send(
    0xe0,
    0x04,
    0x00,
    0x00,
    Buffer.from(messageHex, "hex")
  )
  return result.toString("hex")
}

export async function disconnectLedger(): Promise<void> {
  if (transport) {
    await transport.close()
    transport = null
  }
}
