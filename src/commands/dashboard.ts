import { existsSync } from "node:fs"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { getLatestHcsTopicId } from "../services/ens.js"
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

  const slug = agentEns.replace(/[^a-zA-Z0-9-]/g, "-")
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
