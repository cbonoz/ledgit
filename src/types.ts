export interface ActionConfig {
  type: string
  label: string
  descriptionTemplate: string
  fields: string[]
  riskLevel: "low" | "medium" | "high"
}

export interface AgentConfig {
  name: string
  topicId?: string
}

export interface NetworkConfig {
  hedera?: "testnet" | "mainnet"
  ens?: "sepolia" | "mainnet"
}

export interface LedgitConfig {
  network?: NetworkConfig
  agents?: AgentConfig[]
  actions: ActionConfig[]
}

export interface ActionProposal {
  agent: string
  type: string
  description: string
  payload: Record<string, unknown>
  timestamp: number
}

export interface ActionRecord {
  id: string
  proposal: ActionProposal
  signature: string
  signer: string
  recordedAt: number
  hederaTopicId: string
  hederaSequenceNumber: number
  hederaTimestamp: string
}

export interface HcsMessage {
  sequenceNumber: number
  consensusTimestamp: string
  message: string
  topicId: string
}

export interface VerifyResult {
  agent: string
  topicId: string
  actions: ActionRecord[]
}
