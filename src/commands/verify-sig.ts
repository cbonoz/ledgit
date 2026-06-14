import { queryTopicMessages } from "../services/hedera.js"
import { getLatestHcsTopicId } from "../services/ens.js"
import { decrypt } from "../services/crypto.js"
import * as out from "../services/output.js"

export async function verifySig(agentEns: string, actionId: string): Promise<void> {
  const topicId = (await getLatestHcsTopicId(agentEns)) || process.env.LEDGIT_TOPIC_ID
  if (!topicId) {
    out.error("No HCS topic found.")
    process.exit(1)
  }

  const messages = await queryTopicMessages(topicId)
  const seqNum = parseInt(actionId)
  const useSeqNum = !isNaN(seqNum) && String(seqNum) === actionId
  let found: { message: string; sequenceNumber: number } | null = null
  for (const msg of messages) {
    let raw = msg.message
    if (raw.startsWith("ledgit:enc:")) {
      const result = decrypt(raw)
      if (result.ok) raw = result.text
      else continue
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const match = useSeqNum
        ? msg.sequenceNumber === seqNum
        : parsed.actionId === actionId
      if (match) {
        found = { message: raw, sequenceNumber: msg.sequenceNumber }
        break
      }
    } catch { /* skip */ }
  }

  if (!found) {
    out.error(`Action "${actionId}" not found.`)
    process.exit(1)
  }

  const parsed = JSON.parse(found.message) as Record<string, unknown>
  const signature = parsed?.signature ? String(parsed.signature) : null
  const signedMessage = parsed?.signedMessage ? String(parsed.signedMessage) : null

  out.heading(`Signature Verification — Action #${found.sequenceNumber}`)
  out.keyValue("Action ID", actionId)

  if (!signature || !signedMessage) {
    if (parsed.rogue === true) {
      out.warn("⚠ Rogue action — no Ledger signature available for verification")
      out.warn("   The action executed without human approval on hardware.")
    } else {
      out.info("No signature recorded — action was auto-approved (low risk).")
    }
    out.divider()
    return
  }

  out.keyValue("Signature", signature.slice(0, 42) + "...")

  try {
    const { recoverMessageAddress } = await import("viem")
    const msgBytes = ("0x" + signedMessage) as `0x${string}`
    const recovered = await recoverMessageAddress({
      message: { raw: msgBytes },
      signature: signature as `0x${string}`,
    })
    out.keyValue("Signed By", recovered)
    out.success("Signature verified — address recovered from message + signature")
  } catch (e) {
    out.error("Could not recover address: " + (e as Error).message)
  }
  out.divider()
}
