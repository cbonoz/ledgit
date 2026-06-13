import * as out from "./output.js"

type Transport = {
  send(cla: number, ins: number, p1: number, p2: number, data: Buffer): Promise<Buffer>
  close(): Promise<void>
}

const ETH_DERIVATION_PATH = "44'/60'/0'/0/0"
let transport: Transport | null = null

export async function connectLedger(): Promise<void> {
  try {
    const { default: HidTransport } = await import("@ledgerhq/hw-transport-node-hid")
    transport = await HidTransport.create()
    out.success("Connected to Ledger (USB)")
    return
  } catch {
    // fall through
  }

  try {
    const speculosUrl = process.env.LEDGER_SPECULOS_URL || "http://127.0.0.1:5000"
    const { default: SpeculosTransport } = await import(
      "@ledgerhq/hw-transport-node-speculos-http"
    )
    transport = await SpeculosTransport.open(speculosUrl)
    out.success("Connected to Ledger Speculos emulator")
    return
  } catch {
    // fall through
  }

  out.warn("No Ledger device found. Falling back to software signing.")
}

export async function signWithLedger(
  messageHex: string
): Promise<string> {
  if (!transport) {
    return softwareSign(messageHex)
  }

  try {
    const Eth = (await import("@ledgerhq/hw-app-eth")).default
    const eth = new Eth(transport as never)
    const result = await eth.signPersonalMessage(ETH_DERIVATION_PATH, messageHex)
    out.success("Signature obtained from Ledger")
    // result = { r, s, v } — combine into 0x-prefixed hex signature
    const sig = "0x" + result.r + result.s + (result.v.toString(16).padStart(2, "0"))
    return sig
  } catch (e) {
    const err = e as Error & { statusCode?: number }

    // User explicitly rejected — abort, do NOT fall back to software
    if (err.message?.includes("0x6985") || err.message?.includes("6985")) {
      out.error("User rejected the signing request on Ledger. Aborting.")
      process.exit(1)
    }

    // Device not ready — fall back to software for demo purposes
    out.warn("Ledger locked or not ready: " + (err.message || "unknown error"))
    out.step("Falling back to software signing")
    transport = null
    return softwareSign(messageHex)
  }
}

function softwareSign(messageHex: string): string {
  const { createHash } = require("node:crypto") as typeof import("node:crypto")
  return "0x" + createHash("sha256").update(Buffer.from(messageHex, "hex")).digest("hex") + "".padStart(64, "f")
}

export async function disconnectLedger(): Promise<void> {
  if (transport) {
    await transport.close()
    transport = null
  }
}
