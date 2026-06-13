import { writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { queryTopicMessages } from "../services/hedera.js"
import { getLatestHcsTopicId } from "../services/ens.js"
import * as out from "../services/output.js"

interface ActionEntry {
  sequenceNumber: number
  consensusTimestamp: string
  actionId?: string
  agent?: string
  description?: string
  type?: string
  signature?: string
  payload?: Record<string, unknown>
  riskLevel?: string
}

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
  out.success(`${messages.length} message(s) fetched`)

  const actions: ActionEntry[] = messages.map((msg) => {
    const entry: ActionEntry = {
      sequenceNumber: msg.sequenceNumber,
      consensusTimestamp: msg.consensusTimestamp,
    }
    try {
      const parsed = JSON.parse(msg.message) as Record<string, unknown>
      if (parsed.actionId) entry.actionId = String(parsed.actionId)
      if (parsed.agent) entry.agent = String(parsed.agent)
      if (parsed.description) entry.description = String(parsed.description)
      if (parsed.type) entry.type = String(parsed.type)
      if (parsed.signature) entry.signature = String(parsed.signature)
      if (parsed.riskLevel) entry.riskLevel = String(parsed.riskLevel)
      if (parsed.payload) {
        try {
          const p = typeof parsed.payload === "string" ? JSON.parse(parsed.payload) : parsed.payload
          entry.payload = p as Record<string, unknown>
          if (!entry.riskLevel && typeof p === "object" && p && "riskLevel" in p) {
            entry.riskLevel = String(p.riskLevel)
          }
        } catch {
          entry.payload = { raw: String(parsed.payload).slice(0, 200) }
        }
      }
    } catch {
      // skip unparseable messages
    }
    return entry
  })

  const slug = agentEns.replace(/[^a-zA-Z0-9-]/g, "-")
  const dataDir = join(DASHBOARD_DIR, "data")
  const dataPath = join(dataDir, `${slug}.json`)

  const dashboardData = {
    agent: agentEns,
    topicId,
    generatedAt: new Date().toISOString(),
    actions,
  }

  writeFileSync(dataPath, JSON.stringify(dashboardData, null, 2) + "\n", "utf-8")
  out.success("Data written to " + dataPath)
  out.divider()

  const url = `http://localhost:${DASHBOARD_PORT}/${slug}`

  if (existsSync(join(DASHBOARD_DIR, "node_modules"))) {
    const server = spawn("bun", ["run", "dev"], {
      cwd: DASHBOARD_DIR,
      stdio: "ignore",
      detached: true,
    })
    server.unref()
    out.step("Starting dashboard dev server")
    await new Promise((r) => setTimeout(r, 3000))
  } else {
    out.warn("Dashboard dependencies not installed. Run: cd dashboard && bun install")
    out.hint("Opening data file directly...")
  }

  out.step("Opening browser")
  try {
    const { execSync } = await import("node:child_process")
    if (process.platform === "darwin") {
      execSync(`open "${url}"`)
    } else if (process.platform === "linux") {
      execSync(`xdg-open "${url}" 2>/dev/null || echo ""`)
    } else {
      execSync(`start "" "${url}"`, { shell: true })
    }
    out.success("Browser opened at " + url)
  } catch {
    out.warn("Could not open browser. Visit:")
    out.keyValue("URL", url)
  }

  out.divider()
}
