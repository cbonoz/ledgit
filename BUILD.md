✅ Detailed Build Plan for LEDGIT
ETHGlobal New York 2026 (Solo / Small Team, ~24-36 Hour Timeline)
Project Goal
Build a CLI-first tool that creates verifiable human-authorized audit trails for AI agent actions using Ledger (signing), Hedera HCS (immutable ordered records), and ENS (identity + discovery).
Tech Stack

Language: Node.js + TypeScript (recommended)
CLI: Commander.js
Ledger: Speculos emulator (@ledgerhq/hw-transport-node-speculos-http)
Hedera: @hashgraph/sdk (HCS topic create/submit/query)
ENS: viem + ensjs
Other: dotenv, chalk (nice terminal output)


Phase 0: Setup (1–2 hours)

Create repo: ledgit
npm init -y && npm install typescript ts-node @types/node commander.js dotenv chalk
Install Hedera SDK: npm install @hashgraph/sdk
Install Ledger transport: npm install @ledgerhq/hw-transport-node-speculos-http
Setup .env with testnet keys (Hedera operator, test ENS parent if possible)
Install Speculos (Ledger emulator):Bashpip install speculos
Create basic CLI skeleton with ledgit --help

Milestone: Working ledgit --version command.

Phase 1: Core CLI + Hedera HCS (4–6 hours) — Highest Priority

Implement:
ledgit propose --agent <ens> --type <type> --description "<human readable>" --payload <json>
Create/submit messages to a Hedera Consensus Topic
ledgit record <action-id> — submits signed payload to HCS
ledgit verify <agent-ens> — queries HCS topic and displays timeline


Tips:

Use one persistent testnet HCS topic per agent
Store sequence numbers in ENS text records later

Milestone: Can propose → record → view basic HCS messages in terminal.

Phase 2: Ledger Signing Integration (4–6 hours)

Use Speculos emulator for realistic demo
Flow:
Agent proposes action
Display details
Send to Ledger (via transport) for review + signature
Capture signature hash

Fallback: Software/EVM signature if emulator issues

Milestone: Live (or emulated) “Human presses button on Ledger” step works.

Phase 3: ENS Integration (3–5 hours)

Register subname under a parent (e.g. demo.ledgit.eth)
On record: Update ENS text records with latest HCS sequence number + manifest pointer
ledgit verify resolves ENS → pulls full history from HCS

Milestone: ledgit verify trader-a.ledgit.eth shows clean, ordered audit trail.

Phase 4: Polish, Agent Hooks & Demo (6–8 hours)

Add --json output mode (critical for agents/Claude)
Implement simple agent tool schemas (for OpenClaw/Claude function calling)
Nice terminal formatting + colors
Basic timeline viewer (optional small HTML page opened via CLI)
Record demo video + screenshots
Write strong README with commands, architecture, and sponsor highlights
