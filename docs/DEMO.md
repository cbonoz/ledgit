# LEDGIT · Demo Script

> One of your AI agents just moved real money… can you prove a human authorized it?

## The Scenario

A fintech runs 3 trading agents — `alice`, `bob`, and `charlie` — each managing
different portfolios. The compliance officer needs to prove to auditors that
*every* trade was human-authorized.

Without LEDGIT, she'd sift through 3 separate bot logs with inconsistent
formats, missing signatures, and no way to prove the records weren't tampered
with. With LEDGIT, every agent produces a uniform, verifiable, self-discoverable
audit trail. Agents use the ENS name their operator assigned them — LEDGIT works
with any ENS name you own, no subname service needed.

---

## Step 1: See Available Actions (15 sec)

```bash
ledgit actions list
```

```
  🔴 USDC Transfer (usdc_transfer)
     Send {amount} USDC to {to} for {reason}
     Fields: amount, to, reason

  🔴 Token Swap (token_swap)
     Swap {amountIn} {tokenIn} for {tokenOut} on {dex}
     Fields: amountIn, tokenIn, tokenOut, dex

  🟡 Grant Role (grant_role)
     ...
```

**Say:** *"Each action type is defined in a config file — required fields,
templates, risk levels. Agents discover available actions dynamically. Adding a
new action type is a JSON change, not a code change."*

---

## Step 2: Agent Proposes (20 sec)

```bash
ledgit propose \
  --agent alice.ledgit.eth \
  --type token_swap \
  --fields '{"amountIn":"10000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}'
```

```
  Action Proposal (HIGH RISK)
  ───────────────────────────────
  Agent:       alice.ledgit.eth
  Type:        token_swap
  Description: Swap 10000 USDC for ETH on Uniswap
  Payload:     {"amountIn":"10000",...}
  Timestamp:   2026-06-13T13:52:40.000Z

  Action ID: 7b8a94dc767086fc
```

**Say:** *"The agent proposes a specific trade. The CLI auto-generates the
description from the config template, validates every required field is present,
and flags the risk level. The human sees exactly what they're approving."*

---

## Step 3: Human Approves on Ledger (20 sec)

```bash
ledgit record 7b8a94dc767086fc
```

```
  ✅ Connected to Ledger (USB)
  Agent:       alice.ledgit.eth
  HCS Topic:   0.0.9219676
  Description: Swap 10000 USDC for ETH on Uniswap
  Type:        token_swap
  Risk:        high

  ⏳ Requesting signature on Ledger...
  ✅ Signature obtained from Ledger
  Signature:   0xead9209f36ca017f46237e2b50da385f...

  ⏳ Submitting to Hedera HCS...
  ✅ Recorded on Hedera HCS
  Sequence:    2
  Timestamp:   2026-06-13T13:51:45.000Z
```

**Say (hold up the Ledger):** *"The human reviews the action *on the device* and
presses approve. The cryptographic signature proves a real person authorized
this — not a bot, not a replay. The signed action is then submitted to Hedera
HCS with a network-verified timestamp and sequence number."*

---

## Step 4: Verify Any Agent's Trail (15 sec)

```bash
ledgit verify alice.ledgit.eth
```

```
  Audit Trail: alice.ledgit.eth
  ───────────────────────────────
  Topic:       0.0.9219676

  Links:
  HashScan     https://hashscan.io/testnet/topic/0.0.9219676
  Dashboard    https://ledgitdash.vercel.app/alice-ledgit-eth

  ── Action #3 ──  🔴 HIGH
  Timestamp:   2026-06-13T13:55:45
  Description: Send 2500 USDC to 0xVendor for invoice payment
  Type:        usdc_transfer
  Signature:   0x30c71ccb3787... ✅ Ledger Signed

  ── Action #2 ──  🔴 HIGH
  Timestamp:   2026-06-13T13:51:45
  Description: Swap 10000 USDC for ETH on Uniswap
  Type:        token_swap
  Signature:   0xead9209f36ca... ✅ Ledger Signed

  ✅ 3 action(s) recorded
```

**Say:** *"Same command, same format, every agent. Whether you have 3 agents or
300, the compliance officer gets a uniform, ordered, verifiable trail for every
single one. The ENS text record points to the HCS topic — no config needed."*

---

## Step 5: Dashboard (15 sec)

```bash
ledgit dashboard alice.ledgit.eth
```

Opens `https://ledgitdash.vercel.app` — a visual timeline with
color-coded risk levels, clickable payload details, and signature badges.

**Say:** *"Same data, two views — terminal for agents, browser for stakeholders.
Both pull from the same immutable HCS topic."*

---

## Step 6: Send Real Value (15 sec)

```bash
ledgit send 0.0.5698412 1
```

```
  ✅ Transfer complete
  Tx ID:     0.0.3568415@1781314810.626823782
  Status:    SUCCESS
```

**Say:** *"LEDGIT doesn't just record actions — it executes them on Hedera.
The same flow handles the audit trail AND the actual payment."*

---

## 90-Second Demo Flow

| Time | Step | Visual |
|------|------|--------|
| :00 | `ledgit actions list` | Configurable action types |
| :15 | `ledgit propose --type token_swap --fields '{...}'` | Proposal with risk badge |
| :35 | `ledgit record <id>` | Ledger approval → HCS submission |
| :55 | `ledgit verify alice.ledgit.eth` | Ordered trail with signatures |
| :70 | `ledgit dashboard alice.ledgit.eth` | Browser opens visual timeline |
| :85 | `ledgit send 0.0.5698412 1` | Real HBAR payment executes |
| :90 | Wrap — *"Prove a human authorized every action."* |

---

## Judge Talking Points

**The problem is real and growing:**
- AI agents are moving real money. Regulated companies cannot deploy them
  without proving human oversight.
- Existing audit trails are ad-hoc, inconsistent, and missing critical data.
- Every agent team will need this — it's a $0 market today.

**Why LEDGIT wins:**
- **Ledger:** Hardware proof of human approval, not just a log line
- **Hedera HCS:** Immutable ordering with network-verified timestamps
- **ENS:** Bring your own name — no subname service or platform dependency
- **Configurable schemas:** Standardized audit format regardless of action type
- **CLI-first:** Designed for agents to call, humans to review

**Scale argument:**
*"Without LEDGIT, 10 agents means 10 different audit formats. With LEDGIT, 300
agents means 300 uniform, verifiable, self-discoverable trails — one command
away."*
