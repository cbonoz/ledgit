# LEDGIT · Judge Pitch Script

> A 2-minute walkthrough. Start at the dashboard, then run the CLI demo.

## The Problem — Why Existing Tools Fail

**Say:** *"AI agents are starting to move real money — executing trades, sending payments, managing treasury. But every regulated company hits the same wall: 'Can you prove a human actually authorized this?'"*

**Existing approaches fall short:**

| Approach | Why It Fails |
|----------|-------------|
| **Basic logs** | Easy to fake, tamper, or delete. No cryptographic proof of human intent. |
| **Software prompts** | "Are you sure?" can be bypassed, automated, or ignored by the agent. No hardware root of trust. |
| **Multi-sig wallets** | Designed for humans, not agents. No audit trail of *why* a transaction was approved. |
| **Blockchain explorers** | Show transactions but not the human reasoning or approval context behind them. |
| **Agentic logging platforms** (LangSmith, W&B, MLflow) | Track prompt inputs and outputs but no hardware-backed human approval, immutable records, or on-chain agent identity. |

**Say:** *"LEDGIT bridges the gap between autonomous agents and enterprise compliance. It gives regulators cryptographic proof that a human approved every high-stakes action — with immutable records and self-discoverable identity."*

## 0:00 — Open the Dashboard

```
https://ledgitdash.vercel.app
```

**Say:** *"This is LEDGIT — the auditability CLI for named agents. Every agent
has a human-readable ENS name, every high-risk action requires physical approval
on a Ledger device, and the proof is stored immutably on Hedera HCS. Anyone
resolves the name and sees the complete, verifiable history."*

**Point out the setup flow on the home page:**

1. **Install instructions** are right on the page — `git clone`, `bun install`, `npm link`
2. **"👤 I'm a Human"** tab — click it to show the getting-started steps: install → `ledgit setup` → (optional) link ENS → review actions → verify
3. **"🤖 I'm an Agent"** tab — click it to show how agents self-discover actions via `ledgit tools schema` at startup
4. **Scrolling down** — risk tier comparison table, install guide, agent config, and the "Powered By" section explaining each tool's role

**Say:** *"The entire setup is documented on the page — clone, install, run one command, and your agent is ready to propose actions that require human approval."*

**Optionally, open the architecture diagram:**

```
https://ledgitdash.vercel.app/architecture
```

**Say:** *"Here's how the flow works: the agent proposes → CLI validates → human approves on Ledger → action executes on Hedera → proof stored immutably on HCS → discoverable via ENS. Every action type is configurable."*

## 0:15 — Risk Tiers at a Glance

Run this in the terminal to show the color-coded risk system:

```bash
ledgit actions list
```

```
  🔴 HBAR Transfer (hbar_transfer)      🔴 High risk — requires Ledger approval, recorded to HCS
  🟡 Grant Role (grant_role)             🟡 Medium risk — requires Ledger approval, recorded to HCS
  🟢 Read Agent Logs (read_logs)         🟢 Low risk — auto-approved, recorded to HCS

  To add or edit action types, create or edit: .ledgit/config.json
```

**Say:** *"Every action type has a risk level, required fields, and a description template. High and medium require hardware approval on the Ledger. Low risk auto-approves. All are recorded immutably on Hedera HCS. Sensitive payloads can also be encrypted with AES-256-GCM — the sequence numbers and timestamps stay public, but the content is private to key holders."*

## 0:30 — Run the CLI Demo

Follow **`docs/DEMO.md`** for the full walkthrough:

| # | Action | Time |
|---|--------|------|
| 1 | `ledgit actions list` — risk tiers and configurable types | :15 |
| 2 | `ledgit propose --type hbar_transfer ...` — propose + approve + record | :45 |
| 3 | `ledgit contract 0.0.9224072 increment '[]'` — smart contract call | 1:05 |
| 4 | `ledgit propose --type read_logs ...` — low risk, auto-approved | 1:20 |
| 5 | `ledgit verify alice.ledgit.eth` — ordered trail with signatures | 1:35 |
| 6 | `ledgit dashboard alice.ledgit.eth` — calendar view | 1:50 |

## Key Talking Points

**The problem:** AI agents are moving real money. Regulated companies cannot
deploy them without answering: *"Can you prove a human authorized this?"*
Existing audit tools (logs, software prompts, multi-sig) all fail at providing
cryptographic proof with human context.

**The solution:** LEDGIT is an approval gateway — every action must pass through
before it executes. Hardware proof + immutable records + self-discoverable identity.

**Why it's different:**
- **Ledger:** Physical hardware signing, not a checkbox or log line
- **Hedera HCS:** Sub-second finality, sub-cent fees, immutable ordering
- **ENS:** Bring your own name — no platform dependency, no subname service
- **Risk tiers:** High = Ledger required, low = auto-approved, configurable per action
- **CLI-first:** Agents call it via `ledgit tools schema`, humans review on device
- **Encryption:** AES-256-GCM for sensitive payloads — public ordering, private content

**The ask:** *"Check out the repo at github.com/cbonoz/ledgit, run the demo,
and consider how this enables enterprise adoption of AI agents."*
