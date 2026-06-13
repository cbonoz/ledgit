# LEDGIT · Sponsor Integration

## Why Both Hedera and ENS?

They solve two different problems — LEDGIT needs both.

| | Hedera HCS | ENS |
|---|---|---|
| **Role** | The vault — stores the actual records | The sign on the vault door — makes the vault findable |
| **What it provides** | Immutable ordering, consensus timestamps, sequence numbers | Human-readable agent name, discoverable topic pointer |
| **Without it** | The audit trail could be tampered with or reordered | The audit trail exists but nobody can find it |
| **How they connect** | — | Text record `ledgit.hcs.topic` points to the HCS topic ID |

**Together:** ENS tells you *where* to look (`trader-a.ledgit.eth` → topic `0.0.1234567`). Hedera guarantees the data you find there is authentic, ordered, and immutable. Neither works without the other.

---

## Hedera HCS — Immutable Audit Trail

**File:** `src/services/hedera.ts` (96 lines)

Hedera Consensus Service provides the core of the audit trail — immutable, ordered, timestamped records.

| Command | HCS Interaction |
|---------|----------------|
| `ledgit init --agent <ens>` | Creates a new HCS topic via `TopicCreateTransaction`. Each agent gets one persistent topic. |
| `ledgit record <action-id>` | Submits the human-signed action payload as an HCS message via `TopicMessageSubmitTransaction`. Returns the consensus timestamp and sequence number. |
| `ledgit verify <agent-ens>` | Queries all messages from the agent's topic via `TopicMessageQuery`. Displays the ordered timeline with sequence numbers and timestamps. |
| `ledgit dashboard <agent-ens>` | Same query, rendered as a visual HTML timeline. |

HCS provides the chain of custody — every action has a unique sequence number and a network-verified consensus timestamp that cannot be tampered with.

**Data stored per message:**
```json
{
  "actionId": "a1b2c3d4e5f6g7h8",
  "agent": "trader-a.ledgit.eth",
  "signature": "0xabcd...",
  "payload": "{...}",
  "recordedAt": 1718200000000
}
```

---

## Ledger — Human-in-the-Loop Signing

**File:** `src/services/ledger.ts` (43 lines)

Ledger provides the cryptographic proof that a human authorized the action. The signing step is the core differentiator of LEDGIT.

| Step | What Happens |
|------|-------------|
| `record` calls `connectLedger()` | Connects to Speculos emulator at `LEDGER_SPECULOS_URL` (default `http://127.0.0.1:5000`) |
| Human reviews the action | The CLI displays the action details; on a real Ledger the human would see and confirm on-device |
| `signWithLedger()` | Sends the action payload hash to the Ledger device via APDU `0xe0 0x04`. The device returns a signature. |
| Signature embedded in HCS | The returned signature is included in the HCS message payload for on-chain verification |

**Fallback:** If Speculos is not reachable, `signWithLedger()` falls back to SHA-256 hashing so the demo flow works end-to-end without hardware.

The signature stored in HCS allows anyone to cryptographically verify that a specific human approved the action at a specific time.

---

## ENS — Agent Identity & Discovery

**File:** `src/services/ens.ts` (60 lines)

ENS turns a raw HCS topic ID into a human-readable, discoverable agent identity.

| ENS Record | Purpose |
|------------|---------|
| `ledgit.hcs.topic` | Maps an ENS name (e.g. `trader-a.ledgit.eth`) to its HCS topic ID. This is how `verify` and `dashboard` know which topic to query. |
| `ledgit.hcs.sequence` | Stores the latest HCS sequence number, enabling fast "is there new data?" checks. |

**Resolution flow:**
```
ledgit verify trader-a.ledgit.eth
  → resolve ENS name
  → read text record "ledgit.hcs.topic" → "0.0.1234567"
  → query HCS topic 0.0.1234567
  → display full audit history
```

**Current implementation:** Read operations (`getEnsText`) work via viem against Sepolia. Write operations (`setEnsTextRecord`) log intent — production use requires a wallet signer with ENS ownership.

This makes the audit trail self-discoverable: anyone who knows an agent's ENS name can pull their complete audit history without any centralized registry.

---

## Data Flow Summary

```
Agent CLI                          Ledger              Hedera HCS         ENS
──────                             ──────              ──────────         ───
ledgit propose
  → action proposal created
  → action ID returned
        │
ledgit record <id> ───────────────> connect
        │                          display action
        │                          human approves
        │                          sign payload ─────> submitMessage()
        │                                               consensus ts
        │                          signature ────────> embedded in HCS
        │                                                                    set 'ledgit.hcs.sequence'
ledgit verify <ens> ──────────────────────────────────────────────────────> resolve ENS
                                                                             read 'ledgit.hcs.topic'
                                      <──── queryTopicMessages()
  → display timeline

ledgit dashboard <ens> ───────────────────────────────────────────────────> resolve ENS
                                                                             read 'ledgit.hcs.topic'
                                      <──── queryTopicMessages()
  → open HTML timeline in browser
```

---

**ETHGlobal New York 2026** — Built for the Ledger, Hedera, and ENS tracks.
