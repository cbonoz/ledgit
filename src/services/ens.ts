import { http, createPublicClient, type Address } from "viem"
import { sepolia, mainnet } from "viem/chains"
import { loadActionsConfig } from "./config.js"
import * as out from "./output.js"

let publicClient: ReturnType<typeof createPublicClient> | null = null

function getChain() {
  const config = loadActionsConfig()
  const network = config.network?.ens || "sepolia"
  return network === "mainnet" ? mainnet : sepolia
}

function getDefaultRpc() {
  const config = loadActionsConfig()
  const network = config.network?.ens || "sepolia"
  if (process.env.ENS_RPC_URL) return process.env.ENS_RPC_URL
  return network === "mainnet" ? "https://ethereum-rpc.publicnode.com" : "https://ethereum-sepolia-rpc.publicnode.com"
}

function getClient() {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: getChain(),
      transport: http(getDefaultRpc()),
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
