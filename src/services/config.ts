import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join, homedir } from "node:path"
import type { LedgitConfig, ActionConfig } from "../types.js"
import * as out from "./output.js"

const defaultConfig: LedgitConfig = {
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
      cachedConfig = { actions: [...defaultConfig.actions, ...(user.actions || [])] }
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

export function writeDefaultConfig(): void {
  const dir = join(process.cwd(), ".ledgit")
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
