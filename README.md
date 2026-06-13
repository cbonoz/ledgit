# LEDGIT

> The auditability CLI for named agents. Prove a human authorized every action.

A CLI-first tool that creates cryptographically verifiable audit trails for AI agent actions using **Ledger** (signing), **Hedera HCS** (immutable records), and **ENS** (bring your own name — no subname service, no dependency on us).

---

## The Value

| | Just Let Agents Run | With LEDGIT |
|---|---|---|
| **Human oversight** | None or weak (software prompt only) | Cryptographic human-in-the-loop via Ledger hardware |
| **Auditability** | Basic logs (easy to fake, tamper, lose) | Immutable, ordered, cryptographically verifiable trail on Hedera HCS |
| **Proof of authorization** | "The agent said it did X" | Provable: this specific human reviewed and signed on hardware |
| **Agent identity** | Opaque addresses or temporary IDs | Your own ENS name — human-readable, portable, revocable |
| **Regulatory readiness** | Almost impossible in regulated environments | Production-viable in banks, fintechs, and DAOs |
| **Accountability** | Blame the model / prompt / "it's AI" | Clear chain of custody: Agent proposed → Human approved → Executed |
| **Trust & safety** | High risk of rogue actions | Controlled, reviewed, fully traceable |
| **Debugging** | Hard to reconstruct why something happened | Full timeline with signatures and context |

**The bottom line:** Agents without LEDGIT run on trust. Agents with LEDGIT run on proof.

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

### Quick setup

```bash
ledgit setup
# Interactive: creates .env, prompts for Hedera creds, creates action config, creates first HCS topic
```

## Quick Start

```bash
# 1. Pick any ENS name you own (e.g., myname.eth)
# 2. Set its text record via sepolia.ens.app:
#    ledgit.hcs.topic = <your-new-topic-id>

# Initialize your agent's HCS topic
ledgit init --agent myname.eth

# Save the topic to your ENS text record (one-time setup)
# sepolia.ens.app → myname.eth → Add Record → ledgit.hcs.topic = 0.0.XXXXX

# See available action types
ledgit actions list

# Agent proposes a trade
ledgit propose \
  --agent myname.eth \
  --type token_swap \
  --fields '{"amountIn":"5000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}'

# Human approves on Ledger → recorded to HCS
ledgit record <action-id>

# View the audit trail — resolves via ENS automatically
ledgit verify myname.eth

# Open web dashboard
ledgit dashboard myname.eth

# Send real HBAR
ledgit send 0.0.RECIPIENT 1
```

LEDGIT doesn't require a subname service. Use any ENS name you already own.

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
| `ledgit setup` | Interactive first-run: creates env, config, topic |
| `ledgit propose` | Agent proposes an action with structured, validated fields |
| `ledgit record` | Human signs on Ledger, action recorded immutably on HCS |
| `ledgit verify` | Display ordered audit trail from HCS — resolves via ENS |
| `ledgit dashboard` | Open visual timeline in browser |
| `ledgit init` | Create a new HCS topic for an agent |
| `ledgit send` | Execute a real HBAR transfer on Hedera testnet |
| `ledgit actions list` | Discover available action types (supports `--json`) |

---
## Sponsors

Built for **ETHGlobal New York 2026** — **Ledger**, **Hedera**, and **ENS** tracks.
