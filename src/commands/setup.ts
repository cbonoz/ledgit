import { existsSync, readFileSync, appendFileSync, copyFileSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"
import { createTopic } from "../services/hedera.js"
import { writeDefaultConfig } from "../services/config.js"
import * as out from "../services/output.js"

function prompt(query: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(query, (a) => { rl.close(); resolve(a) }))
}

export async function setup(): Promise<void> {
  console.log("")
  console.log("  ╔══════════════════════════════════════════╗")
  console.log("  ║          LEDGIT Setup                   ║")
  console.log("  ║  Audit trails for AI agents             ║")
  console.log("  ╚══════════════════════════════════════════╝")
  console.log("")

  // Step 1: .env
  const envPath = join(process.cwd(), ".env")
  if (!existsSync(envPath)) {
    out.step("Creating .env")
    copyFileSync(join(process.cwd(), ".env.example"), envPath)
    out.success("Created .env")
  } else {
    out.success(".env found")
  }

  // Step 2: Prompt for Hedera credentials if missing
  const envContent = readFileSync(envPath, "utf-8")
  const needsId = !envContent.includes("HEDERA_OPERATOR_ID=") || envContent.includes("HEDERA_OPERATOR_ID=0.0.")
  const needsKey = !envContent.includes("HEDERA_OPERATOR_KEY=") || envContent.includes("HEDERA_OPERATOR_KEY=302e")

  if (needsId || needsKey) {
    console.log("")
    console.log("  ── Hedera Testnet Credentials ──")
    console.log("  Get these free at https://portal.hedera.com (create a testnet account)\n")

    if (needsId) {
      const id = await prompt("  Enter your HEDERA_OPERATOR_ID (e.g. 0.0.12345): ")
      if (id) appendFileSync(envPath, `\nHEDERA_OPERATOR_ID=${id}`)
    }
    if (needsKey) {
      const key = await prompt("  Enter your HEDERA_OPERATOR_KEY (DER hex): ")
      if (key) appendFileSync(envPath, `\nHEDERA_OPERATOR_KEY=${key}`)
    }
  }

  // Step 3: Create action config
  console.log("")
  writeDefaultConfig()

  // Step 4: Prompt for agent name and create topic
  console.log("")
  console.log("  ── First Agent ──")
  const agentName = await prompt("  Enter your agent's ENS name (e.g. my-agent.ledgit.eth): ")

  if (agentName) {
    const topicId = await createTopic(`ledgit:${agentName}`)
    appendFileSync(envPath, `\nLEDGIT_AGENT=${agentName}\nLEDGIT_TOPIC_ID=${topicId}`)
    console.log("")
    out.success(`Agent ${agentName} created with topic ${topicId}`)
    out.info("Saved to .env")
  }

  // Done
  console.log("")
  console.log("  ╔══════════════════════════════════════════╗")
  console.log("  ║  Setup complete!                        ║")
  console.log("  ║                                         ║")
  console.log("  ║  Next:  ledgit propose ...              ║")
  console.log("  ║         ledgit record  ...              ║")
  console.log("  ║         ledgit verify  <agent>          ║")
  console.log("  ║         ledgit --help                   ║")
  console.log("  ╚══════════════════════════════════════════╝")
  console.log("")
}
