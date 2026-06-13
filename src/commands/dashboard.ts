import { writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { queryTopicMessages } from "../services/hedera.js"
import { getLatestHcsTopicId } from "../services/ens.js"
import { decrypt } from "../services/crypto.js"
import * as out from "../services/output.js"

const DASHBOARD_HOSTED = "https://ledgitdash.vercel.app"
const DASHBOARD_DIR = join(import.meta.dirname, "..", "..", "dashboard")
const DASHBOARD_PORT = 3456

export async function dashboard(agentEns: string): Promise<void> {
  out.heading("Dashboard: " + agentEns)

  const topicId =
    (await getLatestHcsTopicId(agentEns)) || process.env.LEDGIT_TOPIC_ID

  if (!topicId) {
    out.error(`No HCS topic found for ${agentEns}. Set LEDGIT_TOPIC_ID or add ENS text record.`)
    process.exit(1)
  }

  out.keyValue("Topic", topicId)
  out.divider()

  out.step("Fetching HCS messages")
  const messages = await queryTopicMessages(topicId)

  const actions = messages.map((msg) => {
    const entry: { sequenceNumber: number; consensusTimestamp: string; actionId?: string; agent?: string; description?: string; type?: string; signature?: string; riskLevel?: string; payload?: Record<string, unknown> } = {
      sequenceNumber: msg.sequenceNumber,
      consensusTimestamp: msg.consensusTimestamp,
    }
    let rawMessage = msg.message
    if (rawMessage.startsWith("ledgit:enc:")) {
      const result = decrypt(rawMessage)
      if (result.ok) rawMessage = result.text
    }
    try {
      const parsed = JSON.parse(rawMessage) as Record<string, unknown>
      if (parsed.actionId) entry.actionId = String(parsed.actionId)
      if (parsed.agent) entry.agent = String(parsed.agent)
      if (parsed.description) entry.description = String(parsed.description)
      if (parsed.type) entry.type = String(parsed.type)
      if (parsed.signature) entry.signature = String(parsed.signature)
      if (parsed.riskLevel) entry.riskLevel = String(parsed.riskLevel)
      // Fields may be nested inside the payload string
      if (!entry.description || !entry.type && parsed.payload) {
        try {
          const inner = typeof parsed.payload === 'string'
            ? JSON.parse(parsed.payload)
            : parsed.payload as Record<string, unknown>
          if (!entry.description && inner.description) entry.description = String(inner.description)
          if (!entry.type && inner.type) entry.type = String(inner.type)
          if (!entry.riskLevel && inner.riskLevel) entry.riskLevel = String(inner.riskLevel)
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
    return entry
  })

  const slug = agentEns.replace(/[^a-zA-Z0-9-]/g, "-")
  const dataPath = join(DASHBOARD_DIR, "data", `${slug}.json`)
  writeFileSync(dataPath, JSON.stringify({ agent: agentEns, topicId, generatedAt: new Date().toISOString(), actions }, null, 2) + "\n")
  out.success(`${actions.length} action(s) loaded`)

  const localUrl = `http://localhost:${DASHBOARD_PORT}/${slug}`
  const hostedUrl = `${DASHBOARD_HOSTED}/${slug}`

  if (existsSync(join(DASHBOARD_DIR, "node_modules"))) {
    out.step("Starting local dashboard")
    const server = spawn("bun", ["run", "dev"], { cwd: DASHBOARD_DIR, stdio: "ignore", detached: true })
    server.unref()
    await new Promise((r) => setTimeout(r, 3000))
  }

  out.step("Opening browser")
  try {
    const { execSync } = await import("node:child_process")
    if (process.platform === "darwin") {
      execSync(`open "${localUrl}"`)
    } else if (process.platform === "linux") {
      execSync(`xdg-open "${localUrl}" 2>/dev/null || echo ""`)
    } else {
      execSync(`start "" "${localUrl}"`, { shell: "true" } as any)
    }
    out.success("Opened at " + localUrl)
  } catch {
    out.warn("Could not open browser.")
    out.keyValue("Local URL", localUrl)
    out.keyValue("Hosted", hostedUrl)
  }

  out.divider()
}
