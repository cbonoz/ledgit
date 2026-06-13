import { writeFileSync, mkdirSync, existsSync } from "node:fs"
import { join } from "node:path"
import { createHash } from "node:crypto"
import type { ActionProposal } from "../types.js"
import { getActionConfig, fillTemplate, validateFields, requireAgent, getDefaultAgent } from "../services/config.js"
import { submitMessage, transferHbar } from "../services/hedera.js"
import { connectLedger, signWithLedger } from "../services/ledger.js"
import { getLatestHcsTopicId, setEnsTextRecord } from "../services/ens.js"
import { encrypt } from "../services/crypto.js"
import { getHashscanUrl } from "../services/network.js"
import * as out from "../services/output.js"

const PROPOSALS_DIR = join(process.cwd(), ".ledgit", "proposals")

function saveProposal(id: string, proposal: ActionProposal, riskLevel?: string): void {
  if (!existsSync(PROPOSALS_DIR)) mkdirSync(PROPOSALS_DIR, { recursive: true })
  writeFileSync(join(PROPOSALS_DIR, `${id}.json`), JSON.stringify({ ...proposal, riskLevel }, null, 2))
}

export async function propose(
  agent: string,
  type: string,
  description: string | undefined,
  payload: string | undefined,
  fields: string | undefined
): Promise<void> {
  const resolvedAgent = agent || getDefaultAgent()
  if (!resolvedAgent) {
    out.error("No agent specified. Use --agent <name>, add an agent to .ledgit/config.json, or set LEDGIT_AGENT in .env")
    process.exit(1)
  }
  requireAgent(resolvedAgent)

  let payloadObj: Record<string, unknown>

  if (fields) {
    try {
      payloadObj = JSON.parse(fields)
    } catch {
      out.error("--fields must be valid JSON")
      process.exit(1)
    }
  } else if (payload) {
    try {
      payloadObj = JSON.parse(payload)
    } catch {
      out.error("--payload must be valid JSON")
      process.exit(1)
    }
  } else {
    payloadObj = {}
  }

  const actionConfig = getActionConfig(type)
  if (actionConfig) {
    payloadObj.type = type
    const missing = validateFields(actionConfig, payloadObj)
    if (missing.length > 0) {
      out.error(`Missing required fields for '${type}': ${missing.join(", ")}`)
      out.errorLine(`Required: ${actionConfig.fields.join(", ")}`)
      process.exit(1)
    }
    if (!description) {
      description = fillTemplate(actionConfig.descriptionTemplate, payloadObj)
    }
  }

  description = description || `Action of type '${type}'`

  const proposal: ActionProposal = {
    agent: resolvedAgent,
    type,
    description,
    payload: payloadObj,
    timestamp: Date.now(),
  }

  const riskLevel = actionConfig?.riskLevel || "low"
  const riskLabel = actionConfig ? ` (${riskLevel.toUpperCase()} RISK)` : ""
  out.heading("Action Proposal" + riskLabel)
  out.keyValue("Agent", proposal.agent)
  out.keyValue("Type", proposal.type)
  if (actionConfig) out.keyValue("Label", actionConfig.label)
  out.keyValue("Description", proposal.description)
  out.keyValue("Payload", JSON.stringify(proposal.payload))
  out.keyValue("Timestamp", new Date(proposal.timestamp).toISOString())
  out.divider()

  const actionId = createHash("sha256").update(JSON.stringify(proposal)).digest("hex").slice(0, 16)
  saveProposal(actionId, proposal, riskLevel)
  out.keyValue("Action ID", actionId)
  out.divider()

  // --- Now sign and submit to HCS ---

  const topicId =
    (await getLatestHcsTopicId(resolvedAgent)) || process.env.LEDGIT_TOPIC_ID
  if (!topicId) {
    out.error("No HCS topic found. Use 'ledgit init --agent <name>' to create one.")
    process.exit(1)
  }

  const msgPayload = JSON.stringify({ actionId, agent: resolvedAgent, timestamp: Date.now() })
  const messageHex = Buffer.from(msgPayload).toString("hex")

  let signature: string
  if (riskLevel === "low") {
    out.info("Low risk action — no hardware signing required")
    signature = "0x" + createHash("sha256").update(Buffer.from(messageHex, "hex")).digest("hex") + "".padStart(64, "f")
  } else {
    out.step("Requesting signature on Ledger")
    await connectLedger()
    signature = await signWithLedger(messageHex)
  }
  out.keyValue("Signature", signature.slice(0, 42) + "...")
  out.divider()

  // Execute HBAR transfer if applicable, before recording to HCS
  let execHashscan: string | undefined
  if (type === "hbar_transfer" && payloadObj.to && payloadObj.amount) {
    const to = String(payloadObj.to)
    const amount = parseFloat(String(payloadObj.amount))
    if (!isNaN(amount) && amount > 0) {
      out.step("Executing HBAR transfer")
      try {
        const xfer = await transferHbar(to, amount)
        execHashscan = `${getHashscanUrl()}/transaction/${xfer.timestamp}`
        out.success("HBAR transfer complete")
        out.keyValue("Execution Tx", execHashscan)
        out.divider()
      } catch (e) {
        out.error("HBAR transfer failed: " + (e as Error).message)
        process.exit(1)
      }
    }
  }

  const recordPayload = JSON.stringify({
    actionId,
    agent: resolvedAgent,
    signature,
    signedMessage: messageHex,
    ledgerSigned: riskLevel !== "low",
    description,
    type,
    riskLevel,
    payload: JSON.stringify(payloadObj),
    hashscan: execHashscan || null,
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

  await setEnsTextRecord(resolvedAgent, "ledgit.hcs.sequence", String(result.sequenceNumber))
  out.hint("View: ledgit verify " + resolvedAgent)
  out.divider()
}
