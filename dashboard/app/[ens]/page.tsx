import { notFound } from "next/navigation"
import { http, createPublicClient } from "viem"
import { sepolia } from "viem/chains"
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

const DEFAULT_RISK: Record<string, string> = {
  usdc_transfer: "high",
  token_swap: "high",
  grant_role: "medium",
  update_agent_config: "medium",
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
      if (parsed.signature) entry.signature = String(parsed.signature)
      let desc = parsed.description ? String(parsed.description) : undefined
      let type = parsed.type ? String(parsed.type) : undefined
      let risk = parsed.riskLevel ? String(parsed.riskLevel) : undefined
      if ((!desc || !type) && parsed.payload) {
        try {
          const inner = typeof parsed.payload === "string" ? JSON.parse(parsed.payload) : parsed.payload as Record<string, unknown>
          if (!desc && inner.description) desc = String(inner.description)
          if (!type && inner.type) type = String(inner.type)
          if (!risk && inner.riskLevel) risk = String(inner.riskLevel)
        } catch { /* skip */ }
      }
      if (desc) entry.description = desc
      if (type) entry.type = type
      entry.riskLevel = risk || (type && DEFAULT_RISK[type]) || "low"
    } catch { /* skip */ }
    return entry
  })
}

export default async function AgentPage({ params }: { params: Promise<{ ens: string }> }) {
  const { ens } = await params

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
