import { notFound } from "next/navigation"
import { http, createPublicClient } from "viem"
import { sepolia } from "viem/chains"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import ActionTimeline from "../components/ActionTimeline"

interface MirrorMessage {
  sequence_number: number
  consensus_timestamp: string
  message: string
}

interface Action {
  sequenceNumber: number
  consensusTimestamp: string
  actionId?: string
  agent?: string
  description?: string
  type?: string
  signature?: string
  riskLevel?: string
}

interface DashboardData {
  agent: string
  topicId: string
  generatedAt: string
  actions: Action[]
}

async function resolveTopicId(ens: string): Promise<string | null> {
  const rpcUrl = process.env.ENS_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"
  try {
    const client = createPublicClient({ chain: sepolia, transport: http(rpcUrl) })
    const topicId = await client.getEnsText({ name: ens, key: "ledgit.hcs.topic" })
    return topicId
  } catch {
    return null
  }
}

async function fetchFromMirrorNode(topicId: string): Promise<Action[]> {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=50&order=asc`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) return []
  const body = await res.json() as { messages?: MirrorMessage[] }
  return (body.messages || []).map((m) => {
    const entry: Action = {
      sequenceNumber: m.sequence_number,
      consensusTimestamp: m.consensus_timestamp,
    }
    try {
      const decoded = atob(m.message)
      const parsed = JSON.parse(decoded) as Record<string, unknown>
      if (parsed.actionId) entry.actionId = String(parsed.actionId)
      if (parsed.agent) entry.agent = String(parsed.agent)
      if (parsed.description) entry.description = String(parsed.description)
      if (parsed.type) entry.type = String(parsed.type)
      if (parsed.signature) entry.signature = String(parsed.signature)
    } catch { /* skip unparseable */ }
    return entry
  })
}

function loadLocalFile(ens: string): DashboardData | null {
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

  // Try local file first (CLI-generated data)
  const local = loadLocalFile(ens)
  if (local) return <ActionTimeline data={local} />

  // Fall back to live data from Hedera mirror node via ENS
  const topicId = await resolveTopicId(ens)
  if (!topicId) notFound()

  const actions = await fetchFromMirrorNode(topicId)
  return (
    <ActionTimeline
      data={{
        agent: ens,
        topicId,
        generatedAt: new Date().toISOString(),
        actions,
      }}
    />
  )
}

export async function generateMetadata({ params }: { params: Promise<{ ens: string }> }) {
  const { ens } = await params
  return { title: `LEDGIT · ${ens}` }
}
