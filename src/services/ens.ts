import { http, createPublicClient, type Address } from "viem"
import { sepolia } from "viem/chains"
import * as out from "./output.js"

let publicClient: ReturnType<typeof createPublicClient> | null = null

function getClient() {
  if (!publicClient) {
    const rpcUrl = process.env.ENS_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl),
    })
  }
  return publicClient
}

export async function resolveEnsName(name: string): Promise<Address | null> {
  try {
    const address = await getClient().getEnsAddress({ name })
    return address
  } catch {
    return null
  }
}

export async function getEnsTextRecord(
  name: string,
  key: string
): Promise<string | null> {
  try {
    const value = await getClient().getEnsText({ name, key })
    return value
  } catch {
    return null
  }
}

export async function setEnsTextRecord(
  _name: string,
  _key: string,
  _value: string
): Promise<void> {
  // NOTE: Requires wallet with ownership of the ENS name.
  // For the hackathon, we log the intent and return.
  // Implement with a signer (e.g., viem walletClient) for production.
  out.info(`[ENS] Would set text record ${_key}=${_value} on ${_name}`)
}

export async function getLatestHcsTopicId(
  agentEns: string
): Promise<string | null> {
  return getEnsTextRecord(agentEns, "ledgit.hcs.topic")
}

export async function getLatestSequenceNumber(
  agentEns: string
): Promise<string | null> {
  return getEnsTextRecord(agentEns, "ledgit.hcs.sequence")
}
