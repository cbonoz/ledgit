import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { createHash } from "node:crypto"
import { submitMessage } from "../services/hedera.js"
import { signWithLedger, connectLedger } from "../services/ledger.js"
import { getLatestHcsTopicId, setEnsTextRecord } from "../services/ens.js"
import { encrypt } from "../services/crypto.js"
import * as out from "../services/output.js"

function loadProposal(actionId: string): Record<string, unknown> | null {
  const path = join(process.cwd(), ".ledgit", "proposals", `${actionId}.json`)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, "utf-8"))
  } catch {
    return null
  }
}

export async function record(actionId: string): Promise<void> {
  out.heading("Recording Action: " + actionId)

  const proposal = loadProposal(actionId)

  const agent = proposal?.agent
    ? String(proposal.agent)
    : process.env.LEDGIT_AGENT || "unknown.ledgit.eth"

  const topicId =
    (await getLatestHcsTopicId(agent)) || process.env.LEDGIT_TOPIC_ID

  if (!topicId) {
    out.error("No HCS topic found for agent. Set LEDGIT_TOPIC_ID in .env or create one.")
    out.hint("Create a topic first: ledgit init --agent " + agent)
    process.exit(1)
  }

  const riskLevel = proposal?.riskLevel ? String(proposal.riskLevel) : null
  out.keyValue("Agent", agent)
  out.keyValue("HCS Topic", topicId)
  if (proposal?.description) out.keyValue("Description", String(proposal.description))
  if (proposal?.type) out.keyValue("Type", String(proposal.type))
  if (riskLevel) out.keyValue("Risk", riskLevel)
  out.divider()

  const payload = JSON.stringify({ actionId, agent, timestamp: Date.now() })
  const messageHex = Buffer.from(payload).toString("hex")

  // Low risk actions skip hardware approval
  let signature: string
  if (riskLevel === "low") {
    out.info("Low risk action — no hardware signing required")
    signature = "0x" + createHash("sha256").update(Buffer.from(messageHex, "hex")).digest("hex") + "".padStart(64, "f")
  } else {
    await connectLedger()
    out.step("Requesting signature on Ledger")
    signature = await signWithLedger(messageHex)
  }
  out.keyValue("Signature", signature.slice(0, 42) + "...")
  out.divider()

  const recordPayload = JSON.stringify({
    actionId,
    agent,
    signature,
    ledgerSigned: riskLevel !== "low",
    description: proposal?.description || null,
    type: proposal?.type || null,
    riskLevel,
    payload: proposal ? JSON.stringify(proposal.payload) : payload,
    recordedAt: Date.now(),
  })

  const useEncryption = !!process.env.ENCRYPTION_KEY
  const finalMessage = useEncryption ? encrypt(recordPayload) : recordPayload
  if (useEncryption) out.info("Encrypting payload with ENCRYPTION_KEY")

  out.step("Submitting to Hedera HCS")
  const result = await submitMessage(topicId, finalMessage)
  out.success("Recorded on Hedera HCS")
  out.keyValue("Sequence", result.sequenceNumber)
  out.keyValue("Timestamp", result.timestamp)
  out.divider()

  await setEnsTextRecord(agent, "ledgit.hcs.sequence", String(result.sequenceNumber))
  out.hint("View: ledgit verify " + agent)
  out.divider()
}
