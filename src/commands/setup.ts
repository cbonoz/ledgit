import { existsSync, readFileSync, appendFileSync, copyFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"
import { createTopic } from "../services/hedera.js"
import { writeDefaultConfig } from "../services/config.js"
import * as out from "../services/output.js"

const ROOT = join(import.meta.dirname, "..", "..")

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

  const cwd = process.cwd()
  const examplePath = join(ROOT, ".env.example")
  const envPath = join(cwd, ".env")

  // Step 1: .env
  if (!existsSync(envPath)) {
    if (!existsSync(examplePath)) {
      out.error(".env.example not found at " + examplePath)
      out.info("Run setup from the LEDGIT project directory")
      process.exit(1)
    }
    out.step("Creating .env")
    copyFileSync(examplePath, envPath)
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

  // Step 3: Create action config in project directory
  console.log("")
  writeDefaultConfig(cwd)

  // Step 4: Prompt for agent name and create topic
  console.log("")
  console.log("  ── First Agent ──")
  console.log("  LEDGIT works with any ENS name you own (e.g. myname.eth).")
  console.log("  If you don't have one, just pick a local name.\n")
  const agentName = await prompt("  Agent name: ")

  if (agentName) {
    const topicId = await createTopic(`ledgit:${agentName}`)
    appendFileSync(envPath, `\nLEDGIT_AGENT=${agentName}\nLEDGIT_TOPIC_ID=${topicId}`)
    // Register agent in config file
    const configPath = join(cwd, ".ledgit", "config.json")
    if (existsSync(configPath)) {
      try {
        const cfg = JSON.parse(readFileSync(configPath, "utf-8"))
        if (!cfg.agents) cfg.agents = []
        if (!cfg.agents.find((a: any) => a.name === agentName)) {
          cfg.agents.push({ name: agentName, topicId })
          writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n")
          out.info("Agent registered in .ledgit/config.json")
        }
      } catch { /* skip */ }
    }
    console.log("")
    out.success(`Agent ${agentName} created with topic ${topicId}`)
    out.info("Saved to .env")
    console.log("")
    console.log("  ── Optional: Link to ENS ──")
    console.log(`  If you own an ENS name, set the text record:`)
    console.log(`  sepolia.ens.app → your-name.eth → Add Record`)
    console.log(`  ledgit.hcs.topic = ${topicId}`)
    console.log(`  Then 'ledgit verify your-name.eth' resolves automatically.`)
  }

  // Done
  console.log("")
  console.log("  ╔══════════════════════════════════════════════════╗")
  console.log("  ║  Setup complete!                                ║")
  console.log("  ║                                                 ║")
  console.log("  ║  Next:  ledgit actions list                     ║")
  console.log("  ║         ledgit propose --type <action> ...        ║")
  console.log("  ║         (propose auto-signs on Ledger & records)  ║")
  console.log("  ║         ledgit verify  <name>                      ║")
  console.log("  ║         ledgit tools schema  # agent integration  ║")
  console.log("  ║                                                   ║")
  console.log("  ║  Tip: Set ENS text record ledgit.hcs.topic on      ║")
  console.log("  ║  your ENS name so verify resolves automatically.  ║")
  console.log("  ╚════════════════════════════════════════════════════╝")
  console.log("")
}
