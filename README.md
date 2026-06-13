# LEDGIT

> The auditability CLI for named agents. Prove a human authorized every action.

LEDGIT is an **approval gateway** for AI agents. It sits between an agent's
decision and its execution — every high or medium risk action must pass through
before it happens. The human reviews on their Ledger, approves, and the
cryptographic proof is stored immutably on Hedera HCS. Anyone resolves the
agent's ENS name and sees the complete, verifiable history.

No config files, no databases, no centralized registry. Agents are identified
by ENS names like `chrisb.acmeco.eth` instead of cryptic addresses — the name
*is* the audit trail lookup.

Built with **Ledger** (hardware signing), **Hedera HCS** (immutable records),
**ENS** (bring your own name — no subname service needed).

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
# 1. Initialize your agent — creates an HCS topic
ledgit init --agent myname.eth
# → Creates topic 0.0.XXXXX, saves to .env

# 2. (Optional) Link your ENS name to the topic
# sepolia.ens.app → myname.eth → Add Record → ledgit.hcs.topic = 0.0.XXXXX
# Then 'ledgit verify myname.eth' resolves automatically

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
| `ledgit tools schema` | Generate an OpenAI/Claude-compatible tool definition for your agent |

---

## Agent Integration

LEDGIT is an **approval gateway** — it sits in front of your agent's execution
pipeline. The agent calls `ledgit propose` when it wants to execute a
high-stakes action, the human reviews and approves on their Ledger, and the
action is recorded immutably on HCS before it executes.

Add LEDGIT as a tool in your agent framework using the generated schema:

```bash
ledgit tools schema
```

This outputs an OpenAI/Claude-compatible tool definition:

```json
{
  "name": "ledgit_propose",
  "description": "Propose an action for human review on a Ledger device...",
  "parameters": {
    "type": "object",
    "properties": {
      "type": { "enum": ["usdc_transfer", "token_swap", "grant_role", "update_agent_config"] },
      "fields": { "type": "string" }
    }
  }
}
```

Agents discover available actions dynamically via `ledgit actions list --json`.
The schema auto-updates when you add new action types — no code change needed.

---

## Encryption

Sensitive action payloads can be encrypted before HCS submission. The data remains
publicly verifiable (order, timestamps, signatures) but the content is private to
key holders.

```bash
# Generate a 32-byte (64 hex char) key
openssl rand -hex 32

# Add to .env
echo "ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" >> .env

# All subsequent records will be encrypted
ledgit record <action-id>
```

Verify still works — it decrypts using the same key:
```bash
ledgit verify alice.ledgit.eth
# Shows "🔓 Decrypted" next to encrypted actions
```

Without the key, encrypted actions show as "🔒 Encrypted (key needed)" with no
visible payload. The audit trail structure (sequence numbers, timestamps) remains
public.

---

## Prizes & Sponsors

| Prize | Sponsor | Category | Our Fit |
|-------|---------|----------|---------|
| AI & Agentic Payments | **Hedera** ($6,000) | AI agent with HCS audit trail + HBAR payments | Agent proposes → human approves → recorded on HCS. `ledgit send` executes payments. |
| No Solidity Allowed | **Hedera** ($3,000) | Hedera SDK only (no Solidity) | Uses `@hashgraph/sdk` with HCS + HTS. No smart contracts. |
| AI Agents x Ledger | **Ledger** ($10,000) | Human-in-the-loop via hardware signing | `ledgit record` requires physical Ledger approval for high/medium risk actions. |
| Best ENS for AI Agents | **ENS** ($5,000) | ENS as agent identity layer | Agents named by ENS (e.g. `chrisb.acmeco.eth`). Topic discovery via text records. |
| Integrate ENS | **ENS** ($6,000) | Any functional ENS integration | Text record resolution for HCS topic lookup. Pool prize. |

Built for **ETHGlobal New York 2026**.
