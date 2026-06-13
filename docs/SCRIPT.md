# LEDGIT · Live Demo Script

> Follow this on your machine. I'll be the agent running the CLI commands.
> You're the human reviewing and approving on your Ledger.

## The Setup

Acme Corp runs several AI agents to manage their treasury. Each agent has an ENS
name — human-readable, traceable, tied to their role.

**Alice** (`alice.ledgit.eth`) executes trades.
**Bob** (`bob.ledgit.eth`) handles vendor payments.
**Charlie** (`charlie.ledgit.eth`) manages permissions.

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

**You say:** *"Let's see what actions agents can perform."*

```bash
ledgit actions list
```

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

**Set the scene:** *"Meet Alice. She's one of our trading agents at Acme Corp — alice.ledgit.eth. She's been monitoring the markets and wants to execute a trade. Her ENS name is her identity, and every action she takes will be logged under it. Let's see what she proposes."*

```bash
ledgit propose \
  --agent alice.ledgit.eth \
  --type token_swap \
  --fields '{"amountIn":"10000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}'
```

**Expected output:**
```
  Action Proposal (HIGH RISK)
  ───────────────────────────────
  Agent:       alice.ledgit.eth
  Type:        token_swap
  Description: Swap 10000 USDC for ETH on Uniswap
  Action ID:   7b8a94dc767086fc
```

**You say:** *"The CLI auto-generated the description from the template and flagged it as high risk. A human needs to approve this on their Ledger."*

---

## Step 3 — Human Approves on Ledger (30s)

**You say:** *"I'm sending this to my Ledger for review."*

```bash
ledgit record 7b8a94dc767086fc
```

**On your Ledger Stax:** You'll see the action details. **Press Approve.**

**Expected output:**
```
  ✅ Signature obtained from Ledger
  Signature:   0xead9209f36ca...

  ✅ Recorded on Hedera HCS
  Sequence:    2
  Timestamp:   2026-06-13T13:51:45.000Z
```

**You say:** *"I pressed approve. The signature is captured and submitted to Hedera HCS with a verifiable consensus timestamp. The proof is now on the hashgraph — immutable, ordered, and timestamped."*

---

## Step 4 — View the Audit Trail (30s)

```bash
ledgit verify alice.ledgit.eth
```

**Expected output:**
```
  Audit Trail: alice.ledgit.eth
  Topic:       0.0.9219676

  ── Action #2 ──  🔴 HIGH
  Description: Swap 10000 USDC for ETH on Uniswap
  Signature:   0xead9209f36ca... ✅ Ledger Signed

  ── Action #1 ──
  Signature:   0x760c44bec2...

  Links:
  HashScan     https://hashscan.io/testnet/topic/0.0.9219676
  Dashboard    https://ledgitdash.vercel.app/alice-ledgit-eth

  ✅ 2 action(s) recorded
```

**You say:** *"Every action is ordered by sequence number with a consensus timestamp. Each entry includes the cryptographic signature from the Ledger. You can click the links to see the raw data on HashScan or the visual dashboard."*

---

## Step 5 — Dashboard (30s)

```bash
ledgit dashboard alice.ledgit.eth
```

Opens your browser. Click on **Saturday, June 13** to see today's actions.

**You say:** *"Same data, two views — terminal for agents, browser for stakeholders. Both pull from the same immutable HCS topic. The "Go Live" button polls for new actions in real-time."*

---

## Step 6 — Send Real Value (15s)

```bash
ledgit send 0.0.3568415 1
```

**Expected output:**
```
  ✅ Transfer complete
  Tx ID:     0.0.3568415@1781314810.626823782
  Status:    SUCCESS
  View on HashScan https://hashscan.io/testnet/transaction/...
```

**You say:** *"LEDGIT doesn't just record actions — it executes them on Hedera. The audit trail AND the payment in one flow."*

---

## Step 7 — The Rogue Action (optional, 30s)

**You say:** *"What happens if an agent acts without human approval?"*

```bash
# This sends HBAR directly — no proposal, no Ledger
ledgit send 0.0.EVIL_ADDRESS 10000
```

**You say:** *"Now look at the audit trail — there's no record of this on HCS because it skipped LEDGIT entirely. The compliance officer sees the legitimate actions with signatures and this payment doesn't appear at all. That's the red flag."*

```bash
ledgit verify alice.ledgit.eth
# Shows: only the 2 approved actions. Rogue payment is invisible.
```

**You say:** *"Every action not recorded on HCS is invisible to auditors. That's why you want every action going through LEDGIT — so nothing slips through."*

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
