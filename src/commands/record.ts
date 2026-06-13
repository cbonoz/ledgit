import { submitMessage } from "../services/hedera.js"
import { signWithLedger } from "../services/ledger.js"
import { getLatestHcsTopicId, setEnsTextRecord } from "../services/ens.js"
import * as out from "../services/output.js"

export async function record(actionId: string): Promise<void> {
  out.heading("Recording Action: " + actionId)

  const agent = process.env.LEDGIT_AGENT || "unknown.ledgit.eth"
  const topicId =
    (await getLatestHcsTopicId(agent)) || process.env.LEDGIT_TOPIC_ID

  if (!topicId) {
    out.error("No HCS topic found for agent. Set LEDGIT_TOPIC_ID in .env or create one.")
    out.hint("Create a topic first: ledgit init --agent " + agent)
    process.exit(1)
  }

  out.keyValue("Agent", agent)
  out.keyValue("HCS Topic", topicId)
  out.divider()

  const payload = JSON.stringify({ actionId, agent, timestamp: Date.now() })
  const messageHex = Buffer.from(payload).toString("hex")

  out.step("Requesting signature on Ledger")
  const signature = await signWithLedger(messageHex)
  out.keyValue("Signature", signature.slice(0, 42) + "...")
  out.divider()

  const recordPayload = JSON.stringify({
    actionId,
    agent,
    signature,
    payload,
    recordedAt: Date.now(),
  })

  out.step("Submitting to Hedera HCS")
  const result = await submitMessage(topicId, recordPayload)
  out.success("Recorded on Hedera HCS")
  out.keyValue("Sequence", result.sequenceNumber)
  out.keyValue("Timestamp", result.timestamp)
  out.divider()

  await setEnsTextRecord(agent, "ledgit.hcs.sequence", String(result.sequenceNumber))
  out.hint("View: ledgit verify " + agent)
  out.divider()
}
