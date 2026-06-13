import { queryTopicMessages } from "../services/hedera.js"
import { getLatestHcsTopicId } from "../services/ens.js"
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
  out.divider()

  const messages = await queryTopicMessages(topicId)

  if (messages.length === 0) {
    out.info("No messages found in this topic.")
    out.divider()
    return
  }

  for (const msg of messages) {
    let parsed: Record<string, unknown> | null = null
    try {
      parsed = JSON.parse(msg.message)
    } catch {
      parsed = { raw: msg.message.slice(0, 80) }
    }

    out.separator(`Action #${msg.sequenceNumber}`)
    out.keyValue("Timestamp", msg.consensusTimestamp)
    if (parsed) {
      if (parsed.actionId) out.keyValue("Action ID", String(parsed.actionId))
      if (parsed.agent) out.keyValue("Agent", String(parsed.agent))
      if (parsed.description) out.keyValue("Description", String(parsed.description))
      if (parsed.type) out.keyValue("Type", String(parsed.type))
      if (parsed.signature) {
        const sig = String(parsed.signature)
        out.keyValue("Signature", sig.slice(0, 42) + "...")
      }
    }
    out.divider()
  }

  out.success(`${messages.length} action(s) recorded`)
  out.divider()
}
