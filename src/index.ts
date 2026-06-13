#!/usr/bin/env bun

import "dotenv/config"
import { Command } from "commander"
import { createTopic, transferHbar, contractCall, submitMessage } from "./services/hedera.js"
import { propose } from "./commands/propose.js"
import { record } from "./commands/record.js"
import { verify } from "./commands/verify.js"
import { dashboard } from "./commands/dashboard.js"
import { setup as runSetup } from "./commands/setup.js"
import { getLatestHcsTopicId } from "./services/ens.js"
import { getDefaultAgent } from "./services/config.js"
import { getHashscanUrl } from "./services/network.js"
import { connectLedger, signWithLedger } from "./services/ledger.js"

async function resolveTopic(agent?: string): Promise<string | null> {
  const name = agent || getDefaultAgent()
  if (name) {
    const topicId = await getLatestHcsTopicId(name)
    if (topicId) return topicId
  }
  return process.env.LEDGIT_TOPIC_ID || null
}
import { loadActionsConfig, writeDefaultConfig } from "./services/config.js"
import * as out from "./services/output.js"

const program = new Command()

program
  .name("ledgit")
  .description("Verifiable Human-Authorized Audit Trails for AI Agents")
  .version("0.1.0")
  .option("--json", "Output in JSON format")
  .hook("preAction", (thisCmd, actionCmd) => {
    if (program.opts().json) {
      out.setJsonMode(true)
    }
  })

program
  .command("propose")
  .description("Propose an action, sign on Ledger, and record to HCS (all-in-one)")
  .option("--agent <ens>", "Agent ENS name (defaults to LEDGIT_AGENT in .env)")
  .requiredOption("--type <type>", "Action type (e.g. hbar_transfer, token_swap)")
  .option("--description <text>", "Human-readable description (auto-generated from template if omitted)")
  .option("--payload <json>", "JSON payload with action details")
  .option("--fields <json>", "JSON object of field values (alternative to --payload, uses action config)")
  .action(async (opts) => {
    await propose(opts.agent, opts.type, opts.description, opts.payload, opts.fields)
  })

program
  .command("record")
  .description("Record a previously proposed action (propose does this automatically)")
  .argument("[action-id]", "Action ID (auto-detects latest if omitted)")
  .action(async (actionId) => {
    await record(actionId)
  })

program
  .command("verify")
  .description("Verify an agent's audit trail — resolves via ENS automatically")
  .argument("<agent-ens>", "Agent ENS name to verify")
  .action(async (agentEns) => {
    await verify(agentEns)
  })

program
  .command("setup")
  .description("Walk through initial setup: .env, config, first HCS topic")
  .action(async () => {
    await runSetup()
  })

program
  .command("dashboard")
  .description("Open a visual HTML timeline of an agent's audit trail in the browser")
  .argument("<agent-ens>", "Agent ENS name")
  .action(async (agentEns) => {
    await dashboard(agentEns)
  })

program
  .command("init")
  .description("Initialize a new HCS topic for an agent")
  .requiredOption("--agent <ens>", "Agent ENS name")
  .action(async (opts) => {
    out.heading("Initializing HCS topic for " + opts.agent)
    const topicId = await createTopic(`ledgit:${opts.agent}`)
    out.success("Topic created: " + topicId)
    out.divider()
    out.info("Set this in your .env:")
    out.keyValue("LEDGIT_TOPIC_ID", topicId)
    out.divider()
    out.info("Then set ENS text record:")
    out.keyValue("ledgit.hcs.topic", topicId)
    out.divider()
  })

program
  .command("send")
  .description("Send HBAR to a Hedera account")
  .argument("<to>", "Recipient Hedera account ID (e.g. 0.0.12345)")
  .argument("<amount>", "Amount of HBAR to send (e.g. 1)")
  .action(async (to: string, amount: string) => {
    const hbar = parseFloat(amount)
    if (isNaN(hbar) || hbar <= 0) {
      out.error("Amount must be a positive number")
      process.exit(1)
    }
    out.heading(`Sending ${hbar} HBAR to ${to}`)
    const result = await transferHbar(to, hbar)
    out.success("Transfer complete")
    out.keyValue("Tx ID", result.txId)
    out.keyValue("Status", result.status)
    out.keyValue("Timestamp", result.timestamp)
    const hashscanUrl = `${getHashscanUrl()}/transaction/${result.timestamp}`
    out.keyValue("View on HashScan", hashscanUrl)
    // Record the execution result to HCS for audit trail
    const agent = getDefaultAgent() || process.env.LEDGIT_AGENT || "unknown"
    const topicId = await resolveTopic(agent)
    if (topicId) {
      const execRecord = JSON.stringify({
        type: "hbar_transfer",
        description: `Sent ${hbar} HBAR to ${to}`,
        agent,
        to,
        amount: hbar,
        txId: result.txId,
        status: result.status,
        timestamp: result.timestamp,
        hashscan: hashscanUrl,
        recordedAt: Date.now(),
      })
      await submitMessage(topicId, execRecord)
      out.info("Execution proof recorded to HCS")
    }
    out.divider()
  })

program
  .command("contract")
  .description("Call a smart contract function on Hedera (with Ledger approval)")
  .argument("<contract-id>", "Hedera contract ID (e.g. 0.0.12345)")
  .argument("<function>", "Function name (e.g. transfer)")
  .argument("<args>", "JSON array of arguments")
  .action(async (contractId: string, functionName: string, args: string) => {
    let parsed: Record<string, unknown>[]
    try {
      parsed = JSON.parse(args)
    } catch {
      out.error("Args must be a valid JSON array")
      process.exit(1)
    }
    if (!Array.isArray(parsed)) {
      out.error("Args must be a JSON array")
      process.exit(1)
    }
    out.heading(`Contract call: ${functionName} on ${contractId}`)
    out.step("Requesting Ledger approval")
    await connectLedger()
    const msgHex = Buffer.from(JSON.stringify({ contractId, function: functionName, args: parsed })).toString("hex")
    const signature = await signWithLedger(msgHex)
    out.keyValue("Signature", signature.slice(0, 42) + "...")
    out.step("Calling contract")
    const result = await contractCall(contractId, functionName, parsed)
    out.success("Contract call executed")
    out.keyValue("Tx ID", result.txId)
    out.keyValue("Status", result.status)
    out.keyValue("Timestamp", result.timestamp)
    const hashscanUrl = `${getHashscanUrl()}/transaction/${result.timestamp}`
    out.keyValue("View on HashScan", hashscanUrl)
    const topicId = await resolveTopic()
    if (topicId) {
      const agent = getDefaultAgent() || process.env.LEDGIT_AGENT || "unknown"
      const execRecord = JSON.stringify({
        type: "contract_call",
        description: `Called ${functionName} on ${contractId}`,
        riskLevel: "medium",
        signature,
        agent,
        contractId,
        function: functionName,
        args: parsed,
        txId: result.txId,
        status: result.status,
        timestamp: result.timestamp,
        hashscan: hashscanUrl,
        recordedAt: Date.now(),
      })
      await submitMessage(topicId, execRecord)
      out.info("Execution proof recorded to HCS")
    }
    out.divider()
  })

const actionsCmd = program
  .command("actions")
  .description("List and manage configured action types")

actionsCmd
  .command("list")
  .description("List all available action types")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const config = loadActionsConfig()
    if (opts.json) {
      out.json(config.actions)
      return
    }
    out.heading("Available Actions")
    for (const action of config.actions) {
      const icon = action.riskLevel === "high" ? "🔴" : action.riskLevel === "medium" ? "🟡" : "🟢"
      console.log(`  ${icon} ${action.label} (${action.type})`)
      console.log(`     ${action.descriptionTemplate}`)
      console.log(`     Fields: ${action.fields.join(", ")}`)
      console.log("")
    }
    console.log("  ───────────────────────────────────")
    console.log("  🔴 High risk — requires Ledger approval, recorded to HCS")
    console.log("  🟡 Medium risk — requires Ledger approval, recorded to HCS")
    console.log("  🟢 Low risk — auto-approved, recorded to HCS")
    console.log("")
    console.log("  To add or edit action types, create or edit:")
    console.log("  .ledgit/config.json")
    console.log("  Or run: ledgit actions init-config")
    console.log("")
  })

actionsCmd
  .command("init-config")
  .description("Create a default .ledgit/config.json file")
  .action(async () => {
    writeDefaultConfig()
  })

const toolsCmd = program
  .command("tools")
  .description("Generate agent tool definitions for Claude, OpenAI, LangChain, etc.")

toolsCmd
  .command("schema")
  .description("Output an OpenAI/Claude-compatible tool definition for LEDGIT")
  .action(async () => {
    const config = loadActionsConfig()
    const properties: Record<string, unknown> = {
      agent: { type: "string", description: "Your ENS name (e.g. alice.ledgit.eth). Defaults to LEDGIT_AGENT env var." },
      type: { type: "string", description: "Action type", enum: config.actions.map(a => a.type) },
      description: { type: "string", description: "Human-readable description (auto-generated if omitted)" },
      fields: { type: "string", description: "JSON object of field values matching the action type's schema" },
    }

    const schema = {
      name: "ledgit_propose",
      description: "Propose an action that requires human review and approval on a Ledger hardware device. The human reviews details on their Ledger and approves or rejects. All approved actions are recorded immutably on Hedera HCS for audit.",
      parameters: {
        type: "object",
        properties,
        required: ["type"],
      },
    }

    console.log(JSON.stringify(schema, null, 2))
  })

program.parse(process.argv)
