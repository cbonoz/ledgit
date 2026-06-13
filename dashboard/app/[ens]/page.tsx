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
  encrypted?: boolean
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
      // Check if message is encrypted
      if (decoded.startsWith("ledgit:enc:")) {
        entry.encrypted = true
        return entry
      }
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

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ ens: string }>
  searchParams: Promise<{ topic?: string }>
}) {
  const { ens } = await params
  const { topic: searchTopic } = await searchParams

  const topicId = searchTopic || (await resolveTopicId(ens))
  if (!topicId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold mb-4">No audit trail found for {ens}</h1>
        <p className="text-gray-400 text-sm mb-6">
          This ENS name doesn&apos;t have a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit.hcs.topic</code> text record set.
        </p>
        <div className="text-left bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2 mb-6">
          <p><strong>To view data directly, add ?topic=0.0.XXXXX to the URL.</strong></p>
          <p className="text-xs text-gray-400">Or set the ENS text record on sepolia.ens.app to enable automatic resolution.</p>
        </div>
        <a href="/" className="text-indigo-600 text-sm hover:underline">Back to home</a>
      </div>
    )
  }

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
