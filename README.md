# LEDGIT

> The auditability CLI for named agents. Prove a human authorized every action.

A CLI-first tool that creates cryptographically verifiable audit trails for AI agent actions using **Ledger** (signing), **Hedera HCS** (immutable records), and **ENS** (identity + discovery).

---

## Install

**Prerequisites:** [Bun](https://bun.sh) or [Node.js](https://nodejs.org) 20+

### Option 1: Global CLI (recommended)

```bash
git clone https://github.com/cbonoz/ledgit.git
cd ledgit
bun install
npm link

# Verify it works
ledgit --version
ledgit --help
```

Now `ledgit` is available from any directory on your machine.

### Option 2: Run without installing

```bash
git clone https://github.com/cbonoz/ledgit.git
cd ledgit
bun install
bun src/index.ts --help
```

### Option 3: From another project

```bash
cd your-project
bun add -d ledgit@link:../path/to/ledgit
bun run ledgit --help
```

### Setup

```bash
# Copy and edit the env file
cp .env.example .env
# Add your Hedera testnet credentials (free at https://portal.hedera.com)

# Create a default action config
ledgit actions init-config

# Initialize an HCS topic for your agent
ledgit init --agent trader-a.ledgit.eth
# Save the topic ID in .env: LEDGIT_TOPIC_ID=0.0.1234567
```

---

## Quick Demo

```bash
# See available action types
ledgit actions list

# Agent proposes a trade
ledgit propose \
  --agent trader-a.ledgit.eth \
  --type token_swap \
  --fields '{"amountIn":"5000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}'

# Human approves on Ledger → recorded to HCS
ledgit record <action-id>

# View the audit trail
ledgit verify trader-a.ledgit.eth

# Open web dashboard
ledgit dashboard trader-a.ledgit.eth

# Send real HBAR
ledgit send 0.0.RECIPIENT 1
```

---

## Configuration

Action types are defined in `.ledgit/config.json`. The defaults include USDC Transfer, Token Swap, Grant Role, and Update Agent Config — each with required fields, risk level, and a description template.

To create the file:
```bash
ledgit actions init-config
```

To add or modify types, edit `.ledgit/config.json`:
```json
{
  "actions": [
    {
      "type": "my_custom_action",
      "label": "My Custom Action",
      "descriptionTemplate": "Execute {param} on {target}",
      "fields": ["param", "target"],
      "riskLevel": "medium"
    }
  ]
}
```

Agents discover available types dynamically via `ledgit actions list --json`. Adding a new action type is a JSON change, not a code change.

## Commands

| Command | Description |
|---------|-------------|
| `ledgit propose` | Agent proposes an action with structured, validated fields |
| `ledgit record` | Human signs on Ledger, action recorded immutably on HCS |
| `ledgit verify` | Display ordered audit trail from HCS |
| `ledgit dashboard` | Open visual timeline in browser |
| `ledgit init` | Create a new HCS topic for an agent |
| `ledgit send` | Execute a real HBAR transfer on Hedera testnet |
| `ledgit actions list` | Discover available action types (supports `--json`) |
| `ledgit actions init-config` | Create a default `.ledgit/config.json` |

---

## Why This Exists

AI agents are moving real money, but regulated companies cannot deploy them without answering: *"Can you prove a human authorized this?"* LEDGIT provides the answer — every single time — with cryptographic proof, immutable ordering, and self-discoverable identity.

---

## Sponsors

Built for **ETHGlobal New York 2026** — **Ledger**, **Hedera**, and **ENS** tracks.
