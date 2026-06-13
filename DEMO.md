# LEDGIT · Demo Script

## Setup (2 min — prep before judges arrive)

```bash
# 1. Environment
cp .env.example .env
# Edit .env with Hedera testnet credentials

# 2. Install deps
bun install
cd dashboard && bun install && cd ..

# 3. Init the agent's HCS topic
ledgit init --agent trader-a.ledgit.eth

# 4. Create default action config
ledgit actions init-config

# 5. Start dashboard server (optional, pre-warm)
cd dashboard && bun run dev &  # background
cd ..
```

---

## Step 1: Configuration (30 sec)

Show the action types available:

```bash
ledgit actions list
```

```
  Available Actions
  ───────────────────────────────
  🔴 USDC Transfer (usdc_transfer)
     Send {amount} USDC to {to} for {reason}
     Fields: amount, to, reason

  🔴 Token Swap (token_swap)
     Swap {amountIn} {tokenIn} for {tokenOut} on {dex}
     Fields: amountIn, tokenIn, tokenOut, dex

  🟡 Grant Role (grant_role)
     Grant '{role}' role to {address}
     Fields: role, address

  🟡 Update Agent Config (update_agent_config)
     Update {parameter} to {value}
     Fields: parameter, value
```

**Say:** *"LEDGIT is fully configurable — action types, risk levels, and field validation are all defined in a JSON file. Agents can discover available actions dynamically with `--json` output."*

---

## Step 2: Agent Proposes an Action (30 sec)

```bash
ledgit propose \
  --agent trader-a.ledgit.eth \
  --type token_swap \
  --fields '{"amountIn":"5000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}'
```

```
  Action Proposal (HIGH RISK)
  ───────────────────────────────
  Agent:       trader-a.ledgit.eth
  Type:        token_swap
  Label:       Token Swap
  Description: Swap 5000 USDC for ETH on Uniswap
  Payload:     {"amountIn":"5000","tokenIn":"USDC","tokenOut":"ETH","dex":"Uniswap"}
  Timestamp:   2026-06-12T18:30:00.000Z

  Action ID: a1b2c3d4e5f6g7h8

  Next step: ledgit record a1b2c3d4e5f6g7h8
```

**Say:** *"The agent proposes a specific action. The CLI auto-generates the human-readable description from the config template and validates required fields. The high-risk badge signals this needs careful human review."*

---

## Step 3: Human Signs on Ledger (30 sec)

```bash
ledgit record a1b2c3d4e5f6g7h8
```

```
  Recording Action: a1b2c3d4e5f6g7h8
  ───────────────────────────────
  Agent:       trader-a.ledgit.eth
  HCS Topic:   0.0.1234567

  ⏳ Requesting signature on Ledger...
  ✅ Signature obtained
  Signature:   0xabcd1234...7890ef

  ⏳ Submitting to Hedera HCS...
  ✅ Recorded on Hedera HCS
  Sequence:    142
  Timestamp:   2026-06-12T18:30:15.000Z

  [ENS] Would set text record ledgit.hcs.sequence=142 on trader-a.ledgit.eth

  View: ledgit verify trader-a.ledgit.eth
```

**Say:** *"The human reviews the action on their Ledger device and presses approve. The cryptographic signature is captured and submitted to Hedera HCS with a verifiable consensus timestamp. The sequence number is also stored in the agent's ENS text records."*

**Pro-tip:** If Speculos isn't available, the software fallback kicks in seamlessly — the demo flow is identical.

---

## Step 4: Verify the Audit Trail (30 sec)

Propose and record a second action to show an ordered timeline:

```bash
ledgit propose \
  --agent trader-a.ledgit.eth \
  --type usdc_transfer \
  --fields '{"amount":"2500","to":"0xBob","reason":"vendor payment"}'
# → Action ID: i9j8k7l6m5n4o3p2

ledgit record i9j8k7l6m5n4o3p2
```

Now verify:

```bash
ledgit verify trader-a.ledgit.eth
```

```
  Audit Trail: trader-a.ledgit.eth
  ───────────────────────────────
  Topic:       0.0.1234567

  ── Action #142 ──
  Timestamp:   2026-06-12T18:30:15.000Z
  Action ID:   a1b2c3d4e5f6g7h8
  Agent:       trader-a.ledgit.eth
  Description: Swap 5000 USDC for ETH on Uniswap
  Type:        token_swap
  Signature:   0xabcd1234...7890ef

  ── Action #141 ──
  Timestamp:   2026-06-12T18:25:00.000Z
  Action ID:   i9j8k7l6m5n4o3p2
  Agent:       trader-a.ledgit.eth
  Description: Send 2500 USDC to 0xBob for vendor payment
  Type:        usdc_transfer
  Signature:   0xefgh5678...1234ab

  ✅ 2 action(s) recorded
```

**Say:** *"Every action is ordered by HCS sequence number with a network-verified timestamp. Each entry includes the human's cryptographic signature — you can independently verify that a real person approved every single action."*

---

## Step 5: Dashboard Visual (30 sec)

```bash
ledgit dashboard trader-a.ledgit.eth
```

Opens `http://localhost:3456/trader-a-ledgit-eth` in the browser showing:

```
┌────────────────────────────────────────────┐
│  L  LEDGIT                                 │
│  Verifiable Human-Authorized Audit Trails  │
│                                            │
│  trader-a.ledgit.eth                       │
│  Topic: 0.0.1234567 · 2 actions            │
│                                            │
│  [1 High] [1 Medium] [0 Low]              │
│                                            │
│  ● Action #142  🔴 HIGH                    │
│  │  Jun 12, 2026 6:30 PM                   │
│  │  Swap 5000 USDC for ETH on Uniswap      │
│  │  token_swap · a1b2c3d4e5f6g7h8         │
│  │  ✓ Ledger Signature Verified            │
│  │  [▼ expand for payload + raw HCS data]  │
│                                            │
│  ● Action #141  🟡 MEDIUM                  │
│  │  Jun 12, 2026 6:25 PM                   │
│  │  Send 2500 USDC to 0xBob                │
│  │  usdc_transfer · i9j8k7l6m5n4o3p2      │
│  │  ✓ Ledger Signature Verified            │
│  │  [▼ expand for payload + raw HCS data]  │
│                                            │
│  LEDGIT · ETHGlobal NY 2026                │
│  Ledger · Hedera · ENS                     │
└────────────────────────────────────────────┘
```

**Say:** *"The dashboard makes the audit trail immediately readable — color-coded risk levels, expandable payload details, and signature verification badges. Click any card to see the full JSON payload and HCS metadata."*

---

## Full Demo Script (2 minutes)

| Time | Step | Command | Visual |
|------|------|---------|--------|
| 0:00 | Config | `ledgit actions list` | Terminal shows available action types |
| 0:15 | Propose | `ledgit propose --agent trader-a.ledgit.eth --type token_swap --fields '...'` | Terminal shows proposal with risk badge |
| 0:30 | Record | `ledgit record a1b2c3d4e5f6g7h8` | Terminal shows signature + HCS submission |
| 0:45 | Propose #2 | `ledgit propose --agent trader-a.ledgit.eth --type usdc_transfer --fields '...'` | Second action |
| 1:00 | Record #2 | `ledgit record i9j8k7l6m5n4o3p2` | |
| 1:15 | Verify | `ledgit verify trader-a.ledgit.eth` | Terminal shows ordered timeline |
| 1:30 | Dashboard | `ledgit dashboard trader-a.ledgit.eth` | Browser opens visual timeline |
| 1:45 | Explore | Click expand on an action | Show payload + signature details |
| 2:00 | Wrap | "This is how we prove human authorization for AI agents." | |

---

## Judge Talking Points

**Why this matters:**
- Regulated companies can't deploy agents without audit trails
- Hardware signing (Ledger) provides cryptographic proof of human approval
- HCS gives immutable ordering with network-verified timestamps
- ENS makes the trail self-discoverable — anyone can resolve and verify

**What makes LEDGIT different:**
- CLI-first — designed for agent tool calling (Claude/OpenAI function calls)
- Configurable action types — no code changes needed
- Three clear sponsor integrations that each play a distinct role
- Terminal + web visual — works headless for agents, beautiful for demos

**Sponsor highlights:**
- **Ledger:** Human-in-the-loop signing, the core trust mechanism
- **Hedera:** HCS provides the immutable, ordered record layer
- **ENS:** Agent identity and discoverable audit manifest
