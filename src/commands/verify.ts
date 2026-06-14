import { queryTopicMessages } from "../services/hedera.js"
import { getLatestHcsTopicId } from "../services/ens.js"
import { decrypt } from "../services/crypto.js"
import { getHashscanUrl, getMirrorNodeUrl, getEnsAppUrl } from "../services/network.js"
import * as out from "../services/output.js"

export async function verify(agentEns: string): Promise<void> {
  out.heading("Audit Trail: " + agentEns)

  const topicId =
    (await getLatestHcsTopicId(agentEns)) || process.env.LEDGIT_TOPIC_ID

  if (!topicId) {
    out.error(
      `No HCS topic found for ${agentEns}. Ensure ENS text record 'ledgit.hcs.topic' is set.`
    )
    process.exit(1)
  }

  out.keyValue("Topic", topicId)
  out.info("Links:")
  out.keyValue("HashScan Topic", `${getHashscanUrl()}/topic/${topicId}/messages`)
  out.keyValue("Mirror Node", `${getMirrorNodeUrl()}/api/v1/topics/${topicId}/messages`)
  out.keyValue("ENS Profile", getEnsAppUrl(agentEns))
  out.keyValue("Dashboard", `https://ledgitdash.vercel.app/${agentEns}`)
  out.divider()

  const messages = await queryTopicMessages(topicId)

  if (messages.length === 0) {
    out.info("No messages found in this topic.")
    out.divider()
    return
  }

  for (const msg of messages) {
    let raw = msg.message
    let encrypted = false

    if (raw.startsWith("ledgit:enc:")) {
      encrypted = true
      const result = decrypt(raw)
      if (result.ok) {
        raw = result.text
      } else {
        raw = ""
      }
    }

    let parsed: Record<string, unknown> | null = null
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = null
    }

    const DEFAULT_RISK: Record<string, string> = {
      hbar_transfer: "high",
      token_swap: "high",
      grant_role: "medium",
      update_agent_config: "medium",
    }

    out.separator(`Action #${msg.sequenceNumber}`)
    out.keyValue("Timestamp", msg.consensusTimestamp)
    if (encrypted) out.keyValue("Privacy", parsed ? "🔓 Decrypted" : "🔒 Encrypted (key needed)")
    if (parsed) {
      if (parsed.actionId) out.keyValue("Action ID", String(parsed.actionId))
      if (parsed.agent) out.keyValue("Agent", String(parsed.agent))
      const isRogue = parsed.rogue === true
      const hasLedgerSig = parsed.ledgerSigned === true
      if (isRogue) {
        out.warn("⚠ No Ledger signature (rogue action)")
      } else if (parsed.signature && hasLedgerSig) {
        const sig = String(parsed.signature)
        out.keyValue("Signature", `${sig.slice(0, 42)}... ✅ Ledger Signed`)
      } else if (parsed.signature) {
        const sig = String(parsed.signature)
        out.keyValue("Signature", `${sig.slice(0, 42)}...`)
      }
      let desc = parsed.description ? String(parsed.description) : undefined
      let type = parsed.type ? String(parsed.type) : undefined
      let risk = parsed.riskLevel ? String(parsed.riskLevel) : undefined
      if ((!desc || !type) && parsed.payload) {
        try {
          const inner = typeof parsed.payload === 'string'
            ? JSON.parse(parsed.payload)
            : parsed.payload as Record<string, unknown>
          if (!desc && inner.description) desc = String(inner.description)
          if (!type && inner.type) type = String(inner.type)
          if (!risk && inner.riskLevel) risk = String(inner.riskLevel)
        } catch { /* skip */ }
      }
      if (desc) out.keyValue("Description", desc)
      if (type) out.keyValue("Type", type)
      out.keyValue("Risk", (risk || (type && DEFAULT_RISK[type]) || "low").toUpperCase())
      // Show execution tx link if available (from send/contract execution proofs)
      if (parsed?.hashscan) out.keyValue("Execution Tx", String(parsed.hashscan))
    }
    out.keyValue("HCS Record", `${getHashscanUrl()}/transaction/${msg.consensusTimestamp}`)
    out.divider()
  }

  out.success(`${messages.length} action(s) recorded`)
  out.divider()
}
