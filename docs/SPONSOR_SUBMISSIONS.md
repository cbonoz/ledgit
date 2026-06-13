# Sponsor Submission Templates

## ENS

**How are you using this Protocol/API?**
Every agent in LEDGIT identifies by an ENS name like `alice.ledgit.eth`. The
`ledgit.hcs.topic` text record stores the agent's HCS topic ID, so
`ledgit verify alice.ledgit.eth` resolves the complete audit trail automatically.
Without ENS, you'd pass opaque topic IDs manually. With it, the name *is* the
lookup — human-readable, portable, and revocable if a subname is compromised.

**Why you're applicable for this prize:**
ENS is the identity layer for every agent in LEDGIT. Agents discover each other,
store their HCS topic pointers, and present a human-readable identity — all
through ENS text records and subnames. This goes beyond simple address resolution:
ENS is the core discovery mechanism for the entire audit trail system.

**Code:**
https://github.com/cbonoz/ledgit/blob/4ba54be9f2a0f17992b8485271441d80dcc0fb3a/src/services/ens.ts#L50-L55

**Ease of use (1-10):** 8

**Additional feedback for the Sponsor:**
ENSv2 PermissionedRegistry setup (subregistry deployment) was complex — the docs
are dense and aimed at contract developers rather than application builders. The
`ens-cli` tool helped bridge the gap significantly. Having a simpler "create subname
+ set text record" flow without the contract-level registry setup would make ENS
more accessible for hackathon projects. The protocol itself (resolution, text records)
was straightforward once the infrastructure was in place.

---

## Hedera

**How are you using this Protocol/API?**
We use `@hashgraph/sdk` for three Hedera services: HCS (`TopicCreateTransaction`,
`TopicMessageSubmitTransaction`) for immutable audit records, HTS
(`TransferTransaction`) for HBAR payments, and the mirror node REST API for
querying the audit trail from both the CLI and web dashboard. Every signed action
is stored as an HCS message containing the Ledger signature, description, risk
level, and consensus timestamp.

**Why you're applicable for AI & Agentic Payments prize:**
Our project demonstrates the full agentic payment flow: agent proposes → human
approves on Ledger → HBAR transfer executes on Hedera → proof recorded immutably
on HCS. The audit trail and payment execution happen in one seamless flow. We
also qualify for the No Solidity Allowed prize — the entire Hedera integration
uses only the JS SDK with no smart contracts.

**Why you're applicable for No Solidity Allowed prize:**
Uses `@hashgraph/sdk` exclusively with no Solidity smart contracts. Incorporates
two native services (HCS + HTS) and the mirror node REST API for data querying.
The `ledgit contract` command calls EVM smart contracts via the SDK's
`ContractExecuteTransaction`, but the core audit trail and payment flow is pure SDK.

**Code:**
https://github.com/cbonoz/ledgit/blob/4ba54be9f2a0f17992b8485271441d80dcc0fb3a/src/services/hedera.ts#L41-L55

**Ease of use (1-10):** 7

**Additional feedback for the Sponsor:**
The `TopicMessageQuery.subscribe()` API had issues with hanging and incorrect
callback signatures — we switched to the mirror node REST API which was much
more reliable. Some `Long` type handling quirks in the SDK required workarounds.
Topic creation and message submission were clean and well-documented. The mirror
node REST API documentation was excellent and the Swagger UI was helpful for testing.

---

## Ledger

**How are you using this Protocol/API?**
We use `@ledgerhq/hw-transport-node-hid` to connect to the Ledger via USB, and
`@ledgerhq/hw-app-eth` to call `signPersonalMessage()` through the Ethereum app.
The action description, type, and risk level are displayed on the Ledger Stax
screen — the human reviews and approves with one button press. Low-risk actions
skip hardware entirely. The returned signature (`{r, s, v}`) is formatted and
embedded in the HCS message for permanent verifiability.

**Why you're applicable for AI Agents x Ledger prize:**
Hardware signing is the core differentiator of our product. Every high or medium
risk action requires physical approval on a Ledger device — not a bot, not a
replay, not a compromised API key. If the human doesn't press approve, the
action doesn't execute. This is exactly the human-in-the-loop pattern the prize
asks for, and the Ledger signature provides cryptographic proof that a specific
human authorized every action.

**Code:**
https://github.com/cbonoz/ledgit/blob/4ba54be9f2a0f17992b8485271441d80dcc0fb3a/src/services/ledger.ts#L39-L56

**Ease of use (1-10):** 6

**Additional feedback for the Sponsor:**
`hw-transport-node-hid` can hang indefinitely when no device is connected — we
added a 3-second timeout to handle this. The `signPersonalMessage()` return format
changed between library versions (`result.signature` vs raw `{r, s, v}`), which
caused a runtime error. Clearer version-specific migration docs or type exports
would help. Error codes like `0x6985` (user rejected) and `0x5515` (device locked)
were descriptive once found, but mapping them to user-friendly messages required
digging through SDK source code.
