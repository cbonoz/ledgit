# LEDGIT · Live Demo Script

> Follow this on your machine. The AI runs the CLI autonomously — you just
> review and approve on your Ledger when prompted.

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

**Set the scene:** *"Alice — one of our trading agents — wants to send 1 testnet HBAR to a vendor. She calls propose to log the intent for the audit trail."*

```bash
ledgit propose \
  --type usdc_transfer \
  --fields '{"amount":"1","to":"0.0.RECIPIENT","reason":"test payment"}'
```

**Expected output:**
```
  Action Proposal (HIGH RISK)
  ───────────────────────────────
  Agent:       alice.ledgit.eth
  Type:        usdc_transfer
  Description: Send 1 testnet HBAR to 0.0.RECIPIENT for test payment
  Action ID:   df1caafa99360951
```

**You say:** *"The propose step logs the intent for the compliance trail. The actual HBAR transfer will happen when the human approves."*

---

## Step 3 — Human Approves & HBAR Moves (30s)

**You say:** *"The proposal is logged. Now I approve on my Ledger, and the HBAR transfer executes."*

```bash
# Record the action → human signs on Ledger
ledgit record df1caafa99360951

# Then execute the real HBAR transfer
ledgit send 0.0.RECIPIENT 1
```

**On your Ledger Stax:** Review the action details. **Press Approve.**

**Expected output:**
```
  ✅ Signature obtained from Ledger
  Signature:   0xf126cb285d68...

  ✅ Recorded on Hedera HCS
  Sequence:    6

  ✅ Transfer complete
  Status:      SUCCESS
  View on HashScan https://hashscan.io/testnet/transaction/...
```

**You say:** *"The signature is captured, the action is recorded on HCS, and the HBAR actually moved. Two proofs in one flow — the audit trail and the execution."*

---

## Step 3b — What If the Human Says No? (15s)

**You say:** *"What if Alice proposes something the human shouldn't approve?"*

```bash
ledgit propose \
  --type usdc_transfer \
  --fields '{"amount":"10000","to":"0xUnknown","reason":"suspicious"}'
```

**Expected output:**
```
  Action Proposal (HIGH RISK)
  Action ID:   8a4f3e2c1b5d7e9f
```

Now run record — **press Reject on your Ledger** when prompted:

```bash
ledgit record 8a4f3e2c1b5d7e9f
```

**Expected output:**
```
  ✖ User rejected the signing request on Ledger. Aborting.
```

**You say:** *"If the human rejects on the Ledger, the action doesn't execute. No HCS record, no payment, nothing. The hardware guarantees the human must actively approve — there's no 'auto-approve' bypass."*

Verify it never appeared:

```bash
ledgit verify alice.ledgit.eth
# Shows same actions as before. Rejected action is not recorded.
```

**You say:** *"Only approved actions make it to the immutable audit trail. Rejected actions leave no trace — exactly what compliance wants."*

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
