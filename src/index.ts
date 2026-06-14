#!/usr/bin/env bun

import "dotenv/config"
import { Command } from "commander"
import { createTopic } from "./services/hedera.js"
import { propose } from "./commands/propose.js"
import { verify } from "./commands/verify.js"
import { dashboard } from "./commands/dashboard.js"
import { verifySig } from "./commands/verify-sig.js"
import { setup as runSetup } from "./commands/setup.js"
import { loadActionsConfig, writeDefaultConfig, getDefaultAgent } from "./services/config.js"
import * as out from "./services/output.js"

const program = new Command()

program
  .name("ledgit")
  .description("Verifiable Human-Authorized Audit Trails for AI Agents")
  .version("0.1.0")
  .option("--json", "Output in JSON format")
  .addHelpText("afterAll", "\n  FAQ: https://ledgitdash.vercel.app/faq\n  Verify ENS connection: ledgit verify <name>\n")
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
  .option("--rogue", "Bypass Ledger approval even for high/medium risk — marks the audit record as unauthorized")
  .action(async (opts) => {
    await propose(opts.agent, opts.type, opts.description, opts.payload, opts.fields, opts.rogue)
  })

program
  .command("verify")
  .description("Verify an agent's audit trail — resolves via ENS automatically")
  .argument("<agent-ens>", "Agent ENS name to verify")
  .action(async (agentEns) => {
    await verify(agentEns)
  })

program
  .command("verify-sig")
  .description("Recover the signer address from a Ledger signature to verify authenticity")
  .argument("<action-id>", "Action ID from the propose step")
  .option("--agent <ens>", "Agent ENS name (defaults to config or env)")
  .action(async (actionId: string, opts) => {
    const agent = opts.agent || getDefaultAgent()
    if (!agent) {
      out.error("No agent configured. Pass --agent <name>, add one to .ledgit/config.json, or set LEDGIT_AGENT in .env")
      process.exit(1)
    }
    await verifySig(agent, actionId)
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
