import { sendHbar, contractCall } from "./hedera.js"

export interface ExecutionResult {
  description?: string
  txId?: string
  status?: string
  timestamp?: string
  hashscanUrl?: string
}

export type ActionHandler = (
  payload: Record<string, unknown>
) => Promise<ExecutionResult>

const hbarTransfer: ActionHandler = async (payload) => {
  const to = String(payload.to)
  const amount = parseFloat(String(payload.amount))
  if (!to || isNaN(amount) || amount <= 0) {
    return { description: `Send HBAR to ${to} — skipped (invalid amount)` }
  }
  const result = await sendHbar(to, amount)
  return {
    description: `Sent ${amount} HBAR to ${to}`,
    txId: result.txId,
    status: result.status,
    timestamp: result.timestamp,
    hashscanUrl: result.hashscanUrl,
  }
}

const tokenSwap: ActionHandler = async (payload) => {
  const { amountIn, tokenIn, tokenOut, dex } = payload
  return {
    description: `Swap ${amountIn} ${tokenIn} for ${tokenOut} on ${dex}`,
  }
}

const grantRole: ActionHandler = async (payload) => {
  const { role, address } = payload
  return { description: `Grant '${role}' role to ${address}` }
}

const updateAgentConfig: ActionHandler = async (payload) => {
  const { parameter, value } = payload
  return { description: `Update ${parameter} to ${value}` }
}

const readLogs: ActionHandler = async (payload) => {
  const count = payload.count
  return { description: `Read ${count} most recent log entries` }
}

const contractCallHandler: ActionHandler = async (payload) => {
  const contract = String(payload.contract)
  const func = String(payload.function)
  const args = payload.args
  const parsed = Array.isArray(args) ? args : []
  const result = await contractCall(contract, func, parsed as Record<string, unknown>[])
  return {
    description: `Called ${func} on ${contract}`,
    txId: result.txId,
    status: result.status,
    timestamp: result.timestamp,
    hashscanUrl: `https://hashscan.io/testnet/transaction/${result.timestamp}`,
  }
}

const handlers: Record<string, ActionHandler> = {
  hbar_transfer: hbarTransfer,
  token_swap: tokenSwap,
  grant_role: grantRole,
  update_agent_config: updateAgentConfig,
  read_logs: readLogs,
  contract_call: contractCallHandler,
}

export function getActionHandler(type: string): ActionHandler | undefined {
  return handlers[type]
}

export function hasActionHandler(type: string): boolean {
  return type in handlers
}
