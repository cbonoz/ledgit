import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { homedir } from "node:os"
import type { LedgitConfig, ActionConfig } from "../types.js"
import * as out from "./output.js"

const defaultConfig: LedgitConfig = {
  agents: [],
  actions: [
    {
      type: "usdc_transfer",
      label: "USDC Transfer",
      descriptionTemplate: "Send {amount} USDC to {to} for {reason}",
      fields: ["amount", "to", "reason"],
      riskLevel: "high",
    },
    {
      type: "token_swap",
      label: "Token Swap",
      descriptionTemplate:
        "Swap {amountIn} {tokenIn} for {tokenOut} on {dex}",
      fields: ["amountIn", "tokenIn", "tokenOut", "dex"],
      riskLevel: "high",
    },
    {
      type: "grant_role",
      label: "Grant Role",
      descriptionTemplate: "Grant '{role}' role to {address}",
      fields: ["role", "address"],
      riskLevel: "medium",
    },
    {
      type: "update_agent_config",
      label: "Update Agent Config",
      descriptionTemplate: "Update {parameter} to {value}",
      fields: ["parameter", "value"],
      riskLevel: "medium",
    },
    {
      type: "read_logs",
      label: "Read Agent Logs",
      descriptionTemplate: "Read {count} most recent log entries",
      fields: ["count"],
      riskLevel: "low",
    },
  ],
}

function findConfigFile(): string | null {
  const candidates = [
    join(process.cwd(), ".ledgit", "config.json"),
    join(process.cwd(), "ledgit.config.json"),
    join(process.cwd(), ".ledgitrc"),
    join(homedir(), ".ledgit", "config.json"),
  ]
  for (const path of candidates) {
    if (existsSync(path)) return path
  }
  return null
}

let cachedConfig: LedgitConfig | null = null

export function loadActionsConfig(): LedgitConfig {
  if (cachedConfig) return cachedConfig

  const configPath = findConfigFile()
  if (configPath) {
    try {
      const raw = readFileSync(configPath, "utf-8")
      const user = JSON.parse(raw) as LedgitConfig
      const userTypes = new Set((user.actions || []).map((a) => a.type))
      cachedConfig = {
        agents: user.agents || [],
        actions: [...defaultConfig.actions.filter((a) => !userTypes.has(a.type)), ...(user.actions || [])],
      }
      return cachedConfig
    } catch {
      out.warn("Could not parse config at " + configPath + ", using defaults")
    }
  }

  cachedConfig = defaultConfig
  return cachedConfig
}

export function getActionConfig(type: string): ActionConfig | undefined {
  return loadActionsConfig().actions.find((a) => a.type === type)
}

export function requireAgent(name: string): void {
  const config = loadActionsConfig()
  const agents = config.agents || []
  if (agents.length === 0) return // no restrictions
  const match = agents.find((a) => a.name === name)
  if (!match) {
    console.error(`  Error: Agent "${name}" is not registered in .ledgit/config.json`)
    console.error(`  Registered agents: ${agents.map((a) => a.name).join(", ") || "(none)"}`)
    process.exit(1)
  }
}

export function getAgentTopic(name: string): string | undefined {
  const config = loadActionsConfig()
  return (config.agents || []).find((a) => a.name === name)?.topicId
}

export function getDefaultAgent(): string | undefined {
  const config = loadActionsConfig()
  const agents = config.agents || []
  if (agents.length > 0) return agents[0].name
  return process.env.LEDGIT_AGENT || undefined
}

export function fillTemplate(template: string, fields: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in fields ? String(fields[key]) : `{${key}}`
  })
}

export function validateFields(
  config: ActionConfig,
  payload: Record<string, unknown>
): string[] {
  const missing: string[] = []
  for (const field of config.fields) {
    if (!(field in payload) || payload[field] === undefined || payload[field] === "") {
      missing.push(field)
    }
  }
  return missing
}

export function writeDefaultConfig(root?: string): void {
  const dir = join(root || process.cwd(), ".ledgit")
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const configPath = join(dir, "config.json")
  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + "\n")
    out.success("Created " + configPath)
    out.info("Edit it to add your own action types.")
  } else {
    out.info(configPath + " already exists.")
  }
}
