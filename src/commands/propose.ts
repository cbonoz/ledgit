import { writeFileSync, mkdirSync, existsSync } from "node:fs"
import { join } from "node:path"
import { createHash } from "node:crypto"
import type { ActionProposal } from "../types.js"
import { getActionConfig, fillTemplate, validateFields, requireAgent, getDefaultAgent } from "../services/config.js"
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
    agent,
    type,
    description,
    payload: payloadObj,
    timestamp: Date.now(),
  }

  const riskLabel = actionConfig ? ` (${actionConfig.riskLevel.toUpperCase()} RISK)` : ""
  out.heading("Action Proposal" + riskLabel)
  out.keyValue("Agent", proposal.agent)
  out.keyValue("Type", proposal.type)
  if (actionConfig) out.keyValue("Label", actionConfig.label)
  out.keyValue("Description", proposal.description)
  out.keyValue("Payload", JSON.stringify(proposal.payload))
  out.keyValue("Timestamp", new Date(proposal.timestamp).toISOString())
  out.divider()

  const actionId = createHash("sha256").update(JSON.stringify(proposal)).digest("hex").slice(0, 16)
  saveProposal(actionId, proposal, actionConfig?.riskLevel)
  out.keyValue("Action ID", actionId)
  out.hint("Next step: ledgit record " + actionId)
  out.divider()
}
