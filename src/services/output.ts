import chalk from "chalk"

let jsonMode = false

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled
}

function indent(level = 1): string {
  return "  ".repeat(level)
}

export function heading(text: string): void {
  if (!jsonMode) console.log(`\n${indent()}${chalk.bold(text)}\n${indent()}${chalk.dim("─".repeat(35))}`)
}

export function subheading(text: string): void {
  if (!jsonMode) console.log(`\n${indent()}${chalk.cyan(chalk.bold(text))}`)
}

export function keyValue(label: string, value: string | number | undefined | null): void {
  if (jsonMode) return
  const val = value ?? chalk.dim("—")
  console.log(`${indent()}${chalk.dim(label.padEnd(14))} ${val}`)
}

export function errorLine(text: string): void {
  if (!jsonMode) console.error(`${indent()}${chalk.red(text)}`)
}

export function separator(text = ""): void {
  if (jsonMode) return
  console.log(`${indent()}${chalk.cyan(`── ${text}`.trimEnd())}`)
}

export function step(text: string): void {
  if (!jsonMode) console.log(`\n${indent()}${chalk.cyan("⏳")} ${text}...`)
}

export function success(text: string): void {
  if (!jsonMode) console.log(`${indent()}${chalk.green("✅")} ${text}`)
}

export function warn(text: string): void {
  if (!jsonMode) console.warn(`${indent()}${chalk.yellow("⚠")} ${text}`)
}

export function error(text: string): void {
  if (!jsonMode) console.error(`${indent()}${chalk.red("✖")} ${text}`)
}

export function info(text: string): void {
  if (!jsonMode) console.log(`${indent()}${chalk.dim(text)}`)
}

export function hint(text: string): void {
  if (!jsonMode) console.log(`\n${indent()}${chalk.dim(text)}`)
}

export function divider(): void {
  if (!jsonMode) console.log("")
}

export function json(data: unknown): void {
  console.log(JSON.stringify(data, null, 2))
}
