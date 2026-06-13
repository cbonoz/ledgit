# LEDGIT · Judge Pitch Script

> A 2-minute walkthrough. Start at the dashboard, then run the CLI demo.

## 0:00 — Open the Dashboard

```
https://ledgitdash.vercel.app
```

**Say:** *"This is LEDGIT — the auditability CLI for named agents. Every agent
has a human-readable ENS name, every high-risk action requires physical approval
on a Ledger device, and the proof is stored immutably on Hedera HCS. Anyone
resolves the name and sees the complete, verifiable history."*

Click **"👤 I'm a Human"** → shows the setup flow.
Click **"🤖 I'm an Agent"** → shows how agents discover and propose actions.

## 0:30 — Run the CLI Demo

Follow **`docs/DEMO.md`** for the full walkthrough:

| # | Action | Time |
|---|--------|------|
| 1 | `ledgit actions list` — show configurable action types | :30 |
| 2 | `ledgit propose --type usdc_transfer ...` — agent logs intent | :45 |
| 3 | `ledgit record <id>` — approve on Ledger, recorded to HCS | 1:00 |
| 4 | `ledgit contract 0.0.9224072 increment '[]'` — smart contract call | 1:20 |
| 5 | `ledgit propose --type read_logs ...` — low risk, auto-approved | 1:35 |
| 6 | `ledgit verify alice.ledgit.eth` — ordered trail with signatures | 1:50 |
| 7 | `ledgit dashboard alice.ledgit.eth` — calendar view | 2:00 |

## Key Talking Points

**The problem:** AI agents are moving real money. Regulated companies cannot
deploy them without answering: *"Can you prove a human authorized this?"*

**The solution:** LEDGIT is an approval gateway — every action must pass through
before it executes. Hardware proof + immutable records + self-discoverable identity.

**Why it's different:**
- **Ledger:** Physical hardware signing, not a checkbox or log line
- **Hedera HCS:** Sub-second finality, sub-cent fees, immutable ordering
- **ENS:** Bring your own name — no platform dependency, no subname service
- **Risk tiers:** High = Ledger required, low = auto-approved, configurable per action
- **CLI-first:** Agents call it via `ledgit tools schema`, humans review on device

**The ask:** *"Check out the repo at github.com/cbonoz/ledgit, run the demo,
and consider how this enables enterprise adoption of AI agents."*
