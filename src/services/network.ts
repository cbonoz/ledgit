import { loadActionsConfig } from "./config.js"

export function getHederaNetwork(): string {
  return process.env.HEDERA_NETWORK || "testnet"
}

export function getHashscanUrl(): string {
  return `https://hashscan.io/${getHederaNetwork()}`
}

export function getMirrorNodeUrl(): string {
  const network = getHederaNetwork() === "mainnet" ? "mainnet" : "testnet"
  return `https://${network}.mirrornode.hedera.com`
}

export function getEnsNetwork(): string {
  const config = loadActionsConfig()
  return config.network?.ens || "sepolia"
}

export function getEnsAppUrl(name: string): string {
  const network = getEnsNetwork()
  return network === "mainnet"
    ? `https://app.ens.domains/${name}`
    : `https://sepolia.ens.app/name/${name}`
}
