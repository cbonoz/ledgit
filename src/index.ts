#!/usr/bin/env bun

import "dotenv/config"
import { Command } from "commander"
import { createTopic, transferHbar } from "./services/hedera.js"
import { propose } from "./commands/propose.js"
import { record } from "./commands/record.js"
import { verify } from "./commands/verify.js"
import { dashboard } from "./commands/dashboard.js"
import { setup as runSetup } from "./commands/setup.js"
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
  .description("Propose a new agent action for human review")
  .requiredOption("--agent <ens>", "Agent ENS name (e.g. trader-a.ledgit.eth)")
  .requiredOption("--type <type>", "Action type (e.g. usdc_transfer, token_swap)")
  .option("--description <text>", "Human-readable description (auto-generated from template if omitted)")
  .option("--payload <json>", "JSON payload with action details")
  .option("--fields <json>", "JSON object of field values (alternative to --payload, uses action config)")
  .action(async (opts) => {
    await propose(opts.agent, opts.type, opts.description, opts.payload, opts.fields)
  })

program
  .command("record")
  .description("Sign a proposed action and record it on Hedera HCS")
  .argument("<action-id>", "Action ID from the propose step")
  .action(async (actionId) => {
    await record(actionId)
  })

program
  .command("verify")
  .description("Verify an agent's audit trail from HCS")
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
  .description("Send testnet HBAR to a Hedera account")
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
    out.keyValue("View on HashScan", `https://hashscan.io/testnet/transaction/${result.timestamp}`)
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
  })

actionsCmd
  .command("init-config")
  .description("Create a default .ledgit/config.json file")
  .action(async () => {
    writeDefaultConfig()
  })

program.parse(process.argv)
