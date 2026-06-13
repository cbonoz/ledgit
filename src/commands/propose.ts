import type { ActionProposal } from "../types.js"
import { getActionConfig, fillTemplate, validateFields } from "../services/config.js"
import * as out from "../services/output.js"

export async function propose(
  agent: string,
  type: string,
  description: string | undefined,
  payload: string | undefined,
  fields: string | undefined
): Promise<void> {
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

  const { createHash } = await import("node:crypto")
  const actionId = createHash("sha256").update(JSON.stringify(proposal)).digest("hex").slice(0, 16)
  out.keyValue("Action ID", actionId)
  out.hint("Next step: ledgit record " + actionId)
  out.divider()
}
