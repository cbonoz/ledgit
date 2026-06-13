# LEDGIT

> Verifiable Human-Authorized Audit Trails for AI Agents

Want to make a skill that makes it really easy to integrate auditable logs and guarded actions in agentic workflows

A CLI-first tool that creates cryptographically verifiable audit trails for autonomous AI agent actions. Every meaningful agent decision is:

- **Proposed** by the agent
- **Reviewed and signed** by a human on a Ledger hardware device
- **Immutable recorded** and ordered on **Hedera HCS**
- **Discoverable** via a clean **ENS** name (e.g. `trader-a.ledgit.eth`)

Updated LEDGIT Concept with Payments
Core Idea (Enhanced):
LEDGIT becomes a verifiable compliance layer for agentic payments on Hedera.
Flow:

Agent proposes a financial action (e.g. send USDC, token swap, recurring payment).
Human reviews and approves on Ledger device.
Upon approval → LEDGIT executes the actual token transfer / payment on Hedera Testnet.
The full action (proposal + human signature + payment execution) is immutably recorded on Hedera HCS.
Full audit trail is discoverable via ENS.

Built for ETHGlobal New York 2026.

---

## The Problem: Nonstandard Audit Trails

Most agent audit trails today are ad-hoc — a JSON blob here, a log line there, whatever the developer happened to include. This creates three critical failures:

- **Inconsistent formats** — different actions capture different fields; nothing is guaranteed
- **Insufficient data** — critical context (amount, recipient, risk level, human signature) is often missing
- **No discoverability** — audit data is scattered across files, databases, and cloud logs with no standard way to find it

For regulated use, this is a non-starter. Regulators and compliance teams need to know that *every* action captures the *same* set of required data, every time.

## How LEDGIT Solves This

LEDGIT enforces structured, complete audit trails through three mechanisms:

1. **Configurable action schemas** — each action type defines its required fields, human-readable template, and risk level. The CLI validates every proposal against these schemas before it reaches the human.
2. **Immutable, ordered records** — every action is recorded on Hedera HCS with a network-verified consensus timestamp and sequence number. No one can edit, delete, or reorder the trail.
3. **Discoverable identity** — an ENS name resolves to the complete audit history. Anyone who knows the agent's name can pull their full trail.

The result: a standardized, verifiable, and self-discoverable audit trail for every agent action.

---

## Usage

```
ledgit propose --agent <ens> --type <type> [options]
ledgit record <action-id>
ledgit verify <agent-ens>
ledgit dashboard <agent-ens>
ledgit init --agent <ens>
ledgit actions list [--json]
ledgit actions init-config
```

### ledgit propose

Create a new action proposal for human review:

```bash
ledgit propose \
  --agent trader-a.ledgit.eth \
  --type token_swap \
  --fields '{"amountIn":"5000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}'
```

Uses the configurable action system — auto-generates a human-readable description from the template, validates required fields, and displays risk level.

| Option | Description |
|--------|-------------|
| `--agent <ens>` | Agent ENS name (required) |
| `--type <type>` | Action type (required, e.g. `usdc_transfer`, `token_swap`) |
| `--description <text>` | Human-readable description (auto-generated from template if omitted) |
| `--payload <json>` | Raw JSON payload |
| `--fields <json>` | JSON object of field values (uses action config for template + validation) |

### ledgit record

Sign a proposal on Ledger and record it immutably on Hedera HCS:

```bash
ledgit record a1b2c3d4e5f6g7h8
```

Connects to Ledger Speculos (or falls back to software signing), prompts for human approval, then submits the signed payload to the agent's HCS topic.

### ledgit verify

Query and display an agent's complete audit trail from HCS:

```bash
ledgit verify trader-a.ledgit.eth
```

Resolves the ENS name → reads `ledgit.hcs.topic` text record → queries all HCS messages → displays ordered timeline with signatures and timestamps.

### ledgit dashboard

Open a visual HTML audit trail in the browser:

```bash
ledgit dashboard trader-a.ledgit.eth
```

Fetches the same HCS data as `verify`, writes it to `dashboard/data/`, starts a Next.js dev server, and opens a polished timeline UI at `http://localhost:3456/<ens>`. The dashboard features color-coded risk levels, expandable payload details, and signature verification badges.

### ledgit init

Create a new HCS topic for an agent:

```bash
ledgit init --agent trader-a.ledgit.eth
```

### ledgit actions

List configured action types or create a config file:

```bash
ledgit actions list
ledgit actions init-config
```

Add `--json` for machine-readable output (useful for agent tool calling).

### Global flags

| Flag | Description |
|------|-------------|
| `--json` | Output all structured data as JSON |
| `--help` | Show help |
| `--version` | Show version |

---

## Configuration

Action types are defined in `.ledgit/config.json`. Create one with:

```bash
ledgit actions init-config
```

Example:

```json
{
  "actions": [
    {
      "type": "usdc_transfer",
      "label": "USDC Transfer",
      "descriptionTemplate": "Send {amount} USDC to {to} for {reason}",
      "fields": ["amount", "to", "reason"],
      "riskLevel": "high"
    }
  ]
}
```

Each action type defines:
- `type` — machine identifier used in `--type`
- `label` — human-readable name
- `descriptionTemplate` — template string with `{field}` placeholders
- `fields` — required field names
- `riskLevel` — `low`, `medium`, or `high` (displayed during propose)

Config is loaded from: `.ledgit/config.json`, `ledgit.config.json`, `.ledgitrc`, or `~/.ledgit/config.json`.

---

## Environment

```bash
# Hedera Testnet (required)
HEDERA_OPERATOR_ID=0.0.12345
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...

# Ledger Speculos emulator (optional)
LEDGER_SPECULOS_URL=http://127.0.0.1:5000

# ENS RPC URL (optional, default Sepolia public node)
ENS_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Default agent / topic (optional)
LEDGIT_AGENT=trader-a.ledgit.eth
LEDGIT_TOPIC_ID=0.0.1234567
```

---

## Architecture

```
┌─────────────┐     ┌──────────┐     ┌────────────┐
│  AI Agent   │ ──> │  ledgit  │ ──> │   Ledger   │
│  (propose)  │     │   CLI    │     │  (sign)    │
└─────────────┘     └────┬─────┘     └────────────┘
                         │
                   ┌─────▼──────┐
                   │ Hedera HCS │
                   │ (immutable │
                   │  record)   │
                   └─────┬──────┘
                         │
                   ┌─────▼──────┐
                   │ ENS (text  │
                   │  records)  │
                   └────────────┘
```

- **Ledger** — Hardware signing for true human-in-the-loop authorization
- **Hedera HCS** — Immutable sequencing, timestamps, and audit records
- **ENS** — Agent identity + discoverable audit trail manifest (subnames + text records)

---

## Project Structure

```
ledgit/
├── src/
│   ├── index.ts                  # CLI entry point
│   ├── types.ts                  # Shared types
│   ├── commands/
│   │   ├── propose.ts            # ledgit propose
│   │   ├── record.ts             # ledgit record
│   │   ├── verify.ts             # ledgit verify
│   │   └── dashboard.ts          # ledgit dashboard
│   └── services/
│       ├── config.ts             # Action config loader (.ledgit/config.json)
│       ├── hedera.ts             # HCS topic create / submit / query
│       ├── ledger.ts             # Speculos transport + signing
│       ├── ens.ts                # ENS name resolution + text records
│       └── output.ts             # Centralized terminal output (supports --json)
└── dashboard/                    # Next.js web dashboard
    ├── app/
    │   ├── [ens]/page.tsx        # Per-agent audit trail page
    │   ├── components/ActionTimeline.tsx  # Timeline component
    │   ├── layout.tsx
    │   ├── page.tsx              # Landing page
    │   └── not-found.tsx
    ├── data/                     # JSON snapshots written by CLI (gitignored)
    ├── package.json
    └── tailwind.config.ts
```

---

## Development

```bash
# Install dependencies
bun install
cd dashboard && bun install && cd ..

# Run directly
bun src/index.ts --help

# Build
bun run build

# Start built version
node dist/index.js

# Dashboard standalone
cd dashboard && bun run dev
```

---

## Sponsors

Built for **ETHGlobal New York 2026** — Ledger, Hedera, and ENS tracks.
