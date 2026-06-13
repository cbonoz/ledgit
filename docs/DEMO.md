# LEDGIT · Demo Script

One of your AI agents just moved real money… can you prove a human authorized it?

## The Scenario

A fintech runs 3 trading agents — `alice`, `bob`, and `charlie` — each managing
different portfolios. The compliance officer needs to prove to auditors that
*every* trade was human-authorized.

Without LEDGIT, she'd sift through 3 separate bot logs with inconsistent
formats, missing signatures, and no way to prove the records weren't tampered
with. With LEDGIT, every agent produces a uniform, verifiable, self-discoverable
audit trail.

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
  --fields '{"amountIn":"5000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}'
```

```
  Action Proposal (HIGH RISK)
  ───────────────────────────────
  Agent:       alice.ledgit.eth
  Type:        token_swap
  Description: Swap 5000 USDC for ETH on Uniswap
  Payload:     {"amountIn":"5000",...}
  Timestamp:   2026-06-12T18:30:00.000Z

  Action ID: a1b2c3d4e5f6g7h8
```

**Say:** *"The agent proposes a specific trade. The CLI auto-generates the
description from the config template, validates every required field is present,
and flags the risk level. The human sees exactly what they're approving."*

---

## Step 3: Human Approves on Ledger (20 sec)

```bash
ledgit record a1b2c3d4e5f6g7h8
```

```
  ✅ Connected to Ledger (USB)
  Agent:       alice.ledgit.eth
  HCS Topic:   0.0.9219368

  ⏳ Requesting signature on Ledger...
  ✅ Signature obtained from Ledger
  Signature:   0xf56f8a0872ad3ecaa52822a8170d343b...

  ⏳ Submitting to Hedera HCS...
  ✅ Recorded on Hedera HCS
  Sequence:    142
  Timestamp:   2026-06-12T18:30:15.000Z
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
  Topic:       0.0.9219368

  ── Action #142 ──  🔴 HIGH
  Timestamp:   18:30:15
  Description: Swap 5000 USDC for ETH on Uniswap
  Signature:   0xf56f8a0872... ✅ Ledger Signed

  ── Action #141 ──  🟡 MEDIUM
  Timestamp:   18:25:00
  Description: Update risk tolerance to conservative
  Signature:   0xefgh5678... ✅ Ledger Signed

  ✅ 2 action(s) recorded
```

```bash
ledgit verify bob.ledgit.eth
ledgit verify charlie.ledgit.eth
```

**Say:** *"Same command, same format, every agent. Whether you have 3 agents or
300, the compliance officer gets a uniform, ordered, verifiable trail for every
single one. No log spelunking, no format guessing."*

---

## Step 5: Dashboard (15 sec)

```bash
ledgit dashboard alice.ledgit.eth
```

Opens `https://ledgitdash.vercel.app/alice-ledgit-eth` — a visual timeline with
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

| :00 | `ledgit actions list` | Show configurable action types |
| :15 | `ledgit propose ... token_swap` | Agent proposes a trade |
| :35 | `ledgit record <id>` | Human approves on Ledger → HCS |
| :55 | `ledgit verify alice.ledgit.eth` | Show ordered audit trail |
| :70 | `ledgit dashboard alice.ledgit.eth` | Browser opens visual timeline |
| :85 | `ledgit send 0.0.5698412 1` | Execute real HBAR payment |
| :90 | Wrap | *"Prove a human authorized every action."* |

---

## Judge Talking Points

**The problem is real and growing:**
- AI agents are moving real money. Regulated companies cannot deploy them
  without proving human oversight.
- Existing audit trails are ad-hoc, inconsistent, and missing critical data.
- This is a $0 market today — every agent team will need this.

**Why LEDGIT wins:**
- **Ledger:** Hardware proof of human approval, not just a log line
- **Hedera HCS:** Immutable ordering with network-verified timestamps
- **ENS:** Self-discoverable — anyone resolves the name and sees the trail
- **Configurable schemas:** Standardized format regardless of action type
- **CLI-first:** Designed for agents to call, humans to review

**Scale argument:**
*"Without LEDGIT, 10 agents means 10 different audit formats. With LEDGIT, 300
agents means 300 uniform, verifiable, self-discoverable trails — one command
away."*
