# LEDGIT

> Add identity-linked audit trails to any AI agent. Prove a human authorized every high-stakes action.

The biggest blocker to real-world agent adoption: *"Your agent just moved real
money — can you prove a human actually reviewed and authorized it?"*

LEDGIT is a CLI-first compliance toolkit that brings enterprise-grade trust and
auditability to fleets of AI agents. An agent proposes an action → a human
reviews and approves on a Ledger hardware device → the action executes →
the full event (proposal, Ledger signature, execution receipt) is recorded
immutably in chronological order on Hedera HCS.

Each agent gets a clean ENS identity (e.g. `trader-a.acme.eth`). ENS text
records act as the discovery layer, pointing to the HCS topic and latest
sequence number. Logged actions are configurable via `config.json`, letting
enterprises define their own high-stakes operations with custom field schemas,
risk tiers, and execution handlers. `ledgit dashboard` opens a clean visual
timeline of the entire audit trail.

The result: a tamper-proof, cryptographically verifiable chain of custody
that compliance teams, auditors, and regulators can trust instantly — at
~$1/mo for 10k actions. No databases, no centralized registry. Your ENS name
is the audit trail lookup.

Built with **Ledger** (hardware signing), **Hedera HCS** (immutable records),
**ENS** (bring your own name — no subname service needed).

### How it works

1. **Setup** — `ledgit setup` creates `.env` (Hedera credentials), `~/.ledgit/config.json` (action types + risk levels), and an HCS topic for your agent
2. **Agent loads the tool at startup** — agent framework loads `ledgit tools schema` output as a tool definition, giving the agent awareness of available action types and their field schemas
3. **Before executing, agent asks the CLI** — agent calls `ledgit propose --type <action> --fields '{...}'` — CLI validates fields, checks the risk level, gates on Ledger approval if high/medium risk (or auto-approves low risk), executes the action handler, and records the full cryptographic proof to HCS
4. **Verify** — `ledgit verify myname.eth` or `ledgit dashboard myname.eth` displays the complete, ordered audit trail with signatures

Every action — whether human-approved or auto-approved — is recorded immutably on Hedera HCS. High/medium risk actions carry a Ledger signature proving human authorization; low-risk actions are logged with the agent's attestation.

Live site and try here: https://ledgitdash.vercel.app

### Example audit logs

| Agent | HCS Audit Trail | Web Dashboard |
|-------|----------------|---------------|
| `alice.ledgit.eth` | [HashScan](https://hashscan.io/testnet/topic/0.0.9219676/messages) | [ledgitdash.vercel.app/alice.ledgit.eth](https://ledgitdash.vercel.app/alice.ledgit.eth) |

### Risk tiers at a glance

| | Flow | Ledger? |
|---|---|---|
| 🔴 **High risk** (transfer, swap, contract call) | Propose → approve on Ledger → execute → HCS | ✅ Required |
| 🟡 **Medium risk** (grant role, update config) | Propose → approve on Ledger → execute → HCS | ✅ Required |
| 🟢 **Low risk** (read logs, check balance) | Propose → auto-approved → HCS | ❌ Skipped |
| 💀 **Rogue action** (`--rogue` flag) | Propose with `--rogue` — bypasses Ledger, still recorded to HCS as unauthorized | ❌ No human signature |

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

```
ledgit propose --type hbar_transfer --fields '{"to":"0.0.RECIPIENT","amount":"1"}'
  → Validates fields against action config
  → Gates on Ledger: 🔴 high risk → human approves on hardware
  → Executes handler: sends 1 HBAR via Hedera SDK
  → Records to HCS: actionId + signature + execution proof + ENS sequence

ledgit propose --rogue --type hbar_transfer --fields '...'
  → Same pipeline, but skips the Ledger gate
  → HCS record shows rogue: true, ledgerSigned: false — auditor sees unauthorized action
```

**Where existing platforms fall short:**

| Platform | What it tracks | Cost at 10k actions | Has hardware signing? | Immutable? |
|---|---|---|---|---|
| LangSmith, W&B, MLflow | Prompts, models, outputs | $5k–$10k+/yr | ❌ | ❌ |
| DataDog, Splunk | Logs, metrics | ~$0–$100/mo (log ingest) | ❌ | ❌ |
| Multi-sig (Gnosis Safe) | Human tx approvals | ~$0–$1k/mo | ✅ (wallet) | ✅ (on-chain) |
| **LEDGIT** | **Agent actions + human proof** | **~$1/mo (HCS fees)** | **✅ (Ledger hardware)** | **✅ (Hedera HCS)** |

Existing platforms track what the LLM said or store unstructured logs — they don't capture cryptographically verifiable proof of human intent at sub-cent cost.

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
```

---

## Architecture

See the full architecture diagram at **[ledgitdash.vercel.app/architecture](https://ledgitdash.vercel.app/architecture)** — includes step-by-step flow, component interaction, and tech stack overview. Raw SVG: [`docs/architecture.svg`](docs/architecture.svg).

## LEDGIT vs Hedera Agent Kit

The [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit-js) is a LangChain toolkit. LEDGIT adds hardware signing and audit. They're complementary. See the FAQ for a detailed comparison: **[ledgitdash.vercel.app/faq](https://ledgitdash.vercel.app/faq)**

| Feature | Agent Kit | LEDGIT |
|---------|-----------|--------|
| **Blockchain ops** | Full suite | HBAR send + contract calls |
| **Human approval** | Returns unsigned bytes (you handle signing) | **Hardware signing on Ledger device** — human reviews and presses approve |
| **Audit trail** | Logs to HCS via hook | HCS + Ledger signature + ENS name + risk level |
| **Agent identity** | Account ID | **ENS name** (`alice.ledgit.eth`) — human-readable, portable, revocable |
| **Risk levels** | None | Per-action type, low-risk skips hardware |
| **CLI** | N/A | propose (all-in-one), verify, verify-sig, dashboard |
| **Dashboard** | N/A | Calendar view with live polling |

**Compatible.** Use the Agent Kit for agent framework integration (LangChain, Vercel AI SDK), and LEDGIT for hardware signing and audit. The `ledgit tools schema` output can be loaded as a custom tool.

---

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

# Agent proposes — validates, gates on Ledger, calls handler, records to HCS
ledgit propose \
  --agent myname.eth \
  --type hbar_transfer \
  --fields '{"amount":"1","to":"0.0.RECIPIENT","reason":"test payment"}'

# Bypass Ledger approval (rogue) — record shows lack of human authorization
ledgit propose --rogue \
  --agent myname.eth \
  --type hbar_transfer \
  --fields '{"amount":"10000","to":"0.0.EVIL","reason":"unauthorized"}'

# View the audit trail — resolves via ENS automatically
ledgit verify myname.eth

# Open web dashboard
ledgit dashboard myname.eth
```

LEDGIT doesn't require a subname service. Use any ENS name you already own.

**Verify your ENS connection:** `ledgit verify yourname.eth` — if your text record is set, it resolves automatically. If not, the CLI shows what's missing.

---

## Configuration

Action types define what the agent can do — each type has a JSON config entry
and an optional **action handler** that executes the actual work. When you run
`ledgit propose`, the CLI:
1. Validates fields against the config
2. Gates on Ledger approval (if risk level requires it)
3. Calls the **handler** registered for that type
4. Records the full proof (signature + execution result) to HCS

New action types need a config entry (schema + risk level) **and** a handler function registered in
`src/services/actions.ts`:

```json
// .ledgit/config.json
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

```typescript
// src/services/actions.ts
const myCustomAction: ActionHandler = async (payload) => {
  const result = await doSomething(payload.param, payload.target)
  return { txId: result.txId, status: result.status, hashscanUrl: result.hashscanUrl }
}
```

The handler registry is decoupled from the CLI pipeline — adding a new
executable action is one config entry + one handler function.

To create the default config file:
```bash
ledgit actions init-config
```

Run `ledgit actions list` to see available types.

## Commands

| Command | Description |
|---------|-------------|
| `ledgit setup` | Interactive first-run: creates env, config, topic |
| `ledgit propose` | All-in-one: validate, gate on Ledger (or `--rogue`), execute via action handler, record to HCS |
| `ledgit verify` | Display ordered audit trail from HCS — resolves via ENS |
| `ledgit verify-sig` | Recover the signer address from a Ledger signature |
| `ledgit dashboard` | Open visual timeline in browser |
| `ledgit init` | Create a new HCS topic for an agent |
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

# All subsequent proposals will be encrypted
ledgit propose --type hbar_transfer --fields '...'
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

## Tech used

| Sponsor | What we use it for |
|---------|-------------------|
| **Ledger** | `@ledgerhq/hw-app-eth` + `hw-transport-node-hid` — hardware signing of every high/medium risk action. Human reviews and approves on-device before execution. |
| **Hedera** | `@hashgraph/sdk` — HCS for immutable, ordered message records; HTS and SDK for HBAR transfers and contract calls. |
| **ENS** | `@ensdomains/ensjs` — agent identity via ENS names (`alice.ledgit.eth`). Text records (`ledgit.hcs.topic`) enable automatic audit trail resolution. |

---

## Prizes & Sponsors

| Prize | Sponsor | Category | Our Fit |
|-------|---------|----------|---------|
| AI & Agentic Payments | **Hedera** ($6,000) | AI agent with HCS audit trail + HBAR payments | Agent proposes → human approves → recorded on HCS. `ledgit propose --type hbar_transfer` executes payments. |
| No Solidity Allowed | **Hedera** ($3,000) | Hedera SDK only (no Solidity) | Uses `@hashgraph/sdk` with HCS + HTS. No smart contracts. |
| AI Agents x Ledger | **Ledger** ($10,000) | Human-in-the-loop via hardware signing | `ledgit propose` requires physical Ledger approval for high/medium risk actions. |
| Best ENS for AI Agents | **ENS** ($5,000) | ENS as agent identity layer | Agents named by ENS (e.g. `chrisb.acmeco.eth`). Topic discovery via text records. |
| Integrate ENS | **ENS** ($6,000) | Any functional ENS integration | Text record resolution for HCS topic lookup. Pool prize. |

Built for **ETHGlobal New York 2026**.

