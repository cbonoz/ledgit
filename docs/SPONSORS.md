# LEDGIT · Sponsor Integration

## Why Both Hedera and ENS?

They solve two different problems — LEDGIT needs both.

| | Hedera HCS | ENS |
|---|---|---|
| **Role** | The vault — stores the actual records | The sign on the vault door — makes the vault findable |
| **What it provides** | Immutable ordering, consensus timestamps, sequence numbers | Human-readable agent name, discoverable topic pointer |
| **Without it** | The audit trail could be tampered with or reordered | The audit trail exists but nobody can find it |
| **How they connect** | — | Text record `ledgit.hcs.topic` points to the HCS topic ID |

**Together:** ENS tells you *where* to look (`chrisb.acmeco.eth` → topic `0.0.9219676`). Hedera guarantees the data you find there is authentic, ordered, and immutable. Neither works without the other.

LEDGIT works with any ENS name you own — companies create subnames like `chrisb.acmeco.eth` for each employee, giving every agent a human-readable, traceable identity.

---

## Hedera HCS — Immutable Audit Trail + Payments

**File:** `src/services/hedera.ts` (104 lines)

Hedera Consensus Service provides the core of the audit trail — immutable, ordered, timestamped records. Hedera Token Service (`TransferTransaction`) enables agentic audited payments.

| Command | Hedera Interaction |
|---------|-------------------|
| `ledgit init --agent <ens>` | Creates a new HCS topic via `TopicCreateTransaction`. Each agent gets one persistent topic. |
| `ledgit record <action-id>` | Submits the human-signed action payload as an HCS message via `TopicMessageSubmitTransaction`. Returns the consensus timestamp and sequence number. |
| `ledgit verify <agent-ens>` | Queries the Hedera mirror node REST API for the agent's topic messages. Displays ordered timeline with sequence numbers and timestamps. |
| `ledgit dashboard <agent-ens>` | Same query, rendered as a visual web timeline with monthly grouping and live polling. |
| `ledgit send <to> <amount>` | Executes a real HBAR transfer on Hedera testnet via `TransferTransaction`. |

HCS provides the chain of custody — every action has a unique sequence number and a network-verified consensus timestamp that cannot be tampered with. Optional AES-256-GCM encryption keeps sensitive payload data private while preserving public verifiability.

**Data stored per message:**
```json
{
  "actionId": "3a4fbca8a1f82615",
  "agent": "alice.ledgit.eth",
  "signature": "0x6bc6e9bff7de...",
  "description": "Send 500 USDC to 0xAlice for bonus",
  "type": "usdc_transfer",
  "riskLevel": "high",
  "payload": "{...}",
  "recordedAt": 1781359056000
}
```

---

## Ledger — Human-in-the-Loop Signing

**File:** `src/services/ledger.ts` (78 lines)

Ledger provides the cryptographic proof that a human authorized the action. The signing step is the core differentiator of LEDGIT. Every high or medium risk action requires physical approval on a Ledger device — not a bot, not a replay, not a compromised API key.

| Step | What Happens |
|------|-------------|
| Connects via USB | Tries physical Ledger via `@ledgerhq/hw-transport-node-hid` first, falls back to Speculos emulator |
| Human reviews | The action description, type, and risk level are displayed on the Ledger device |
| Signs via Ethereum app | Uses `@ledgerhq/hw-app-eth` `signPersonalMessage()` — the human approves with one button press |
| Signature on HCS | The returned `{r, s, v}` signature is formatted and embedded in the HCS message |

**Fallback:** If no Ledger is connected, falls back to SHA-256 software signing so the demo flow works end-to-end without hardware.

---

## ENS — Bring Your Own Name

**File:** `src/services/ens.ts` (60 lines)

ENS replaces opaque addresses with human-readable agent names. LEDGIT doesn't require a subname service — use any ENS name you already own.

| ENS Record | Purpose |
|------------|---------|
| `ledgit.hcs.topic` | Maps an ENS name (e.g. `alice.ledgit.eth`) to its HCS topic ID. This is how `verify` and `dashboard` know which topic to query. |
| `ledgit.hcs.sequence` | Stores the latest HCS sequence number, enabling fast "is there new data?" checks. |

**Resolution flow:**
```
ledgit verify alice.ledgit.eth
  → resolve ENS name via viem (Sepolia)
  → read text record "ledgit.hcs.topic" → "0.0.9219676"
  → query HCS topic 0.0.9219676 via mirror node
  → display full audit history
```

**Current implementation:** Read operations (`getEnsText`) work via viem against Sepolia. Write operations (`setEnsTextRecord`) log intent — production use requires a wallet signer with ENS ownership.

---

## Architecture

```
┌──────────────┐     ┌──────────┐     ┌─────────────┐
│  AI Agent    │ ──> │  ledgit  │ ──> │   Ledger    │
│  (propose)   │     │   CLI    │     │  hardware   │
└──────────────┘     └────┬─────┘     └─────────────┘
                          │
                    ┌─────▼───────┐
                    │  Hedera     │
                    │  HCS + HTS  │
                    │  (immutable │
                    │   records + │
                    │   payments) │
                    └─────┬───────┘
                          │
                    ┌─────▼───────┐
                    │  ENS text   │
                    │  records    │
                    │  (discovery)│
                    └─────────────┘
```

---

## Prize Eligibility (ETHGlobal New York 2026)

| Prize | Amount | Fit |
|-------|--------|-----|
| **AI & Agentic Payments on Hedera** | $6,000 | Strong — HCS audit trails + HBAR payments via `ledgit send`. Complements the Agent Kit's LangChain tools with hardware signing. |
| **No Solidity Allowed — Build with Hedera SDKs** | $3,000 | Qualifies — uses `@hashgraph/sdk`, HCS + HTS, no Solidity |
| **Best ENS Integration for AI Agents** | $5,000 | Strong — ENS names as agent identity with text record resolution |
| **Most Creative Use of ENS** | $5,000 | Possible — storing HCS topic pointers in text records for agent discovery |
| **Integrate ENS** | $6,000 | Qualifies — any functional ENS integration is eligible |
| **Ledger** | $10,000 | TBD — check Ledger prize requirements |

---

**ETHGlobal New York 2026** — Built for the Ledger, Hedera, and ENS tracks.
