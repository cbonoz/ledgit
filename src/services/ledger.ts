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
    transport = await Promise.race([
      (HidTransport as any).create(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ])
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
    transport = await (SpeculosTransport as any).open(speculosUrl)
    out.success("Connected to Ledger Speculos emulator")
    return
  } catch {
    // fall through
  }

  transport = null
}

export async function signWithLedger(
  messageHex: string
): Promise<string> {
  if (!transport) {
    throw new Error("No Ledger device found. Plug in your Ledger and open the Ethereum app.")
  }

  try {
    const Eth = (await import("@ledgerhq/hw-app-eth")).default as any
    const eth = new Eth(transport)
    const result = await eth.signPersonalMessage(ETH_DERIVATION_PATH, messageHex)
    out.success("Signature obtained from Ledger")
    const sig = "0x" + result.r + result.s + (result.v.toString(16).padStart(2, "0"))
    return sig
  } catch (e) {
    const err = e as Error & { statusCode?: number }

    if (err.message?.includes("0x6985") || err.message?.includes("6985")) {
      out.error("User rejected the signing request on Ledger. Aborting.")
      process.exit(1)
    }

    throw new Error("Ledger signing failed: " + (err.message || "unknown error"))
  }
}

export async function disconnectLedger(): Promise<void> {
  if (transport) {
    await transport.close()
    transport = null
  }
}
