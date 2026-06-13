import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { notFound } from "next/navigation"
import ActionTimeline from "../components/ActionTimeline"

interface DashboardData {
  agent: string
  topicId: string
  generatedAt: string
  actions: {
    sequenceNumber: number
    consensusTimestamp: string
    actionId?: string
    description?: string
    type?: string
    signature?: string
    riskLevel?: string
    payload?: Record<string, unknown>
  }[]
}

function loadData(ens: string): DashboardData | null {
  const slug = ens.replace(/[^a-zA-Z0-9-]/g, "-")
  const path = join(process.cwd(), "data", `${slug}.json`)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as DashboardData
  } catch {
    return null
  }
}

export default async function AgentPage({ params }: { params: Promise<{ ens: string }> }) {
  const { ens } = await params
  const data = loadData(ens)
  if (!data) notFound()
  return <ActionTimeline data={data} />
}

export async function generateMetadata({ params }: { params: Promise<{ ens: string }> }) {
  const { ens } = await params
  return { title: `LEDGIT · ${ens}` }
}
