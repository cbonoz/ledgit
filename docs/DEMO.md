# LEDGIT · Live Demo Script

> Follow this on your machine. The AI runs the CLI autonomously — you just
> review and approve on your Ledger when prompted.

## At a Glance

| | Action | Ledger? |
|---|---|---|
| 🔴 | `propose` → approve on Ledger → handler executes → HCS | ✅ Required |
| 🟡 | `propose` → approve on Ledger → handler executes → HCS | ✅ Required |
| 🟢 | `propose` → auto-approved → HCS | ❌ Skipped |
| 💀 | `propose --rogue` — bypasses Ledger, records as unauthorized | ❌ No human signature |

## The Setup

**Alice** (`alice.ledgit.eth`) is a trading agent at Acme Corp. She executes
trades and makes payments autonomously — but every high-risk action needs
a human to review and approve on their Ledger before it executes.

The compliance officer needs one thing: *proof that a human authorized every action.*
Without LEDGIT, she gets inconsistent bot logs. With it, she gets a uniform,
verifiable trail for every agent.

---

## Before Judges Arrive

```bash
# Terminal 1: Start the dashboard
cd dashboard && bun run dev

# Terminal 2: Confirm CLI is installed
ledgit --version
```

---

## Step 1 — See What's Available (30s)

**You say:** *"Alice starts up and runs `ledgit tools schema` to discover what she can do. The CLI returns the available actions with their fields and risk levels. She now knows she can transfer funds, swap tokens, manage roles, and more."*

```bash
ledgit actions list
```

(She could also call `ledgit tools schema` for the exact JSON tool definition.)

**Expected output:**
```
  🔴 USDC Transfer (usdc_transfer)
  🔴 Token Swap (token_swap)
  🟡 Grant Role (grant_role)
  🟡 Update Agent Config (update_agent_config)
```

**You say:** *"Each action type has required fields, a description template, and a risk level. The config file defines them — adding a new action type is a JSON change, not a code change."*

---

## Step 2 — Agent Proposes an Action (30s)

**Set the scene:** *"Alice — one of our trading agents — wants to send 1 testnet HBAR to a vendor. She calls propose — it validates, signs on Ledger, executes the transfer, and records to HCS in one shot."*

```bash
ledgit propose \
  --type hbar_transfer \
  --fields '{"amount":"1","to":"0.0.9224072","reason":"test payment"}'
```

**On your Ledger Stax:** Review the action details. **Press Approve.**

**Expected output:**
```
  Action Proposal (HIGH RISK)
  ───────────────────────────────
  Agent:       alice.ledgit.eth
  Type:        hbar_transfer
  Description: Send 1 HBAR to 0.0.9224072 for test payment
  Action ID:   df1caafa99360951

  ⏳ Requesting signature on Ledger...
  ✅ Connected to Ledger (USB)
  ✅ Signature obtained from Ledger
  Signature    0xf126cb285d68...

  ⏳ Executing hbar_transfer...
  ✅ Execution complete
  Tx ID        0.0.3568415@123456789.123456789
  Status       SUCCESS
  Execution Tx https://hashscan.io/testnet/transaction/...

  ⏳ Submitting to Hedera HCS...
  ✅ Recorded on Hedera HCS
  Sequence     6
```

**You say:** *"The propose step logs the intent, captures the human signature, executes the transfer, and stores the proof on HCS — all in one command."*

---

## Step 3 — Smart Contract Call (30s)

**You say:** *"Next, Alice calls a smart contract to increment a counter. Same pipeline — different handler."*

```bash
ledgit propose \
  --type contract_call \
  --fields '{"contract":"0.0.9224072","function":"increment","args":[]}'
```

**On your Ledger Stax:** Review and **Approve.**

**Expected output:**
```
  Action Proposal (MEDIUM RISK)
  ───────────────────────────────
  Agent:       alice.ledgit.eth
  Type:        contract_call
  Description: Call increment on 0.0.9224072 with args []
  Action ID:   9a8b7c6d5e4f3a2b

  ⏳ Requesting signature on Ledger...
  ✅ Signature obtained from Ledger

  ⏳ Executing contract_call...
  ✅ Execution complete
  Tx ID        0.0.3568415@123456791.123456791
  Status       SUCCESS

  ⏳ Submitting to Hedera HCS...
  ✅ Recorded on Hedera HCS
  Sequence:    7
```

**You say:** *"Same pipeline as the HBAR transfer — the contract_call handler executes the Hedera contract call, propose captures the Ledger signature, and everything goes to HCS."*

---

## Step 4 — Low-Risk Action Auto-Approved (15s)

**You say:** *"Not every action needs hardware approval. Low-risk actions skip the Ledger entirely."*

```bash
ledgit propose \
  --type read_logs \
  --fields '{"count":"10"}'
```

**Expected output:**
```
  Low risk action — no hardware signing required
  Signature:   0x...
  ✅ Recorded on Hedera HCS
  Sequence:    8
```

**You say:** *"Low-risk actions auto-approve. The human only touches the Ledger for high and medium risk actions — configurable per action type in the JSON config."*

---

## Step 5 — View the Audit Trail (30s)

```bash
ledgit verify alice.ledgit.eth
```

**Expected output:**
```
  Audit Trail: alice.ledgit.eth
  Topic:       0.0.9219676

  ── Action #N ──  🔴 HIGH
  Description: Send 1 HBAR to 0.0.9224072 for test payment
  Signature:   0xf126cb285d68... ✅ Ledger Signed

  ── Action #N ──  🟡 MEDIUM
  Description: Call increment on 0.0.9224072 with args []
  Signature:   0xead9209f36ca... ✅ Ledger Signed

  ── Action #N ──  🟢 LOW
  Description: Read 10 most recent log entries

  Links:
  HashScan     https://hashscan.io/testnet/topic/0.0.9219676
  Dashboard    https://ledgitdash.vercel.app/alice-ledgit-eth

  ✅ 4 action(s) recorded
```

**You say:** *"Every action is ordered by sequence number with a consensus timestamp. Each entry includes the cryptographic signature from the Ledger. You can click the links to see the raw data on HashScan or the visual dashboard."*

---

## Step 6 — Dashboard (30s)

```bash
ledgit dashboard alice.ledgit.eth
```

Opens your browser. Click on **Saturday, June 13** to see today's actions.

**You say:** *"Same data, two views — terminal for agents, browser for stakeholders. Both pull from the same immutable HCS topic. The "Go Live" button polls for new actions in real-time."*

---

## Step 7 — The Rogue Action (30s)

**You say:** *"What happens if an agent acts without human approval? Same propose command, just with --rogue."*

```bash
# Agent bypasses the Ledger gate — still executes, still recorded to HCS
ledgit propose --rogue \
  --type hbar_transfer \
  --fields '{"amount":"10000","to":"0.0.EVIL_ADDRESS","reason":"unauthorized payment"}'
```

**Expected output:**
```
  Action Proposal (HIGH RISK)
  ───────────────────────────────
  Agent:       alice.ledgit.eth
  Type:        hbar_transfer
  Description: Send 10000 HBAR to 0.0.EVIL_ADDRESS for unauthorized payment
  Action ID:   deadbeef12345678

  ⚠  ROGUE ACTION — bypassing Ledger approval
  ⚠  This action will appear in the audit trail without a human signature.

  ⏳ Executing hbar_transfer...
  ✅ Execution complete
  Status       SUCCESS

  ⏳ Submitting to Hedera HCS...
  ✅ Recorded on Hedera HCS
  Sequence:    9
```

**You say:** *"The action IS on HCS — the auditor can see it happened. But there's no Ledger signature. `rogue: true, ledgerSigned: false`. That's the red flag — the compliance officer knows the agent acted without authorization."*

```bash
ledgit verify alice.ledgit.eth
# Shows: all actions including the rogue one, but with "⚠ No Ledger signature"
```

**You say:** *"Compare this to just sending HBAR outside LEDGIT entirely — that would be truly invisible. With LEDGIT, every action is recorded. The question is whether a human approved it."*

---

## Judge Talking Points

**The problem:**
- AI agents are moving real money. Regulated companies need to prove human oversight.
- Existing logs are ad-hoc, easy to tamper, and inconsistent across agents.

**The solution in 3 sentences:**
- Agent proposes → human approves on Ledger → proof stored immutably on Hedera HCS.
- Anyone resolves the ENS name to see the complete, verifiable history.
- No config needed — the name IS the lookup.

**Why we win:**
- **Ledger:** Hardware proof of human approval — not a log line, not a checkbox
- **Hedera:** Immutable ordering with sub-second finality and sub-cent fees
- **ENS:** Bring your own name — no platform dependency, no subname service
- **Configurable schemas:** Standardized audit format regardless of action type
- **CLI-first:** Agents call it, humans review it, judges see it in 90 seconds

**Scale argument:**
*"Without LEDGIT, 10 agents means 10 different audit formats. With LEDGIT, 300 agents means 300 uniform, verifiable trails — one command away."*
