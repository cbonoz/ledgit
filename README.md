# LEDGIT

> The auditability CLI for named agents. Prove a human authorized every action.

> Enterprise-grade compliance for AI agents. Propose → approve on Ledger → execute on Hedera → immutable audit trail → discoverable via ENS.

## The Problem

AI agents are starting to move real money, but regulated companies cannot adopt them without answering one critical question: *"Can you prove a human actually authorized this?"* Most audit trails are ad-hoc, inconsistent, and missing critical data — a non-starter for compliance.

## The Solution

LEDGIT enforces a standardized, verifiable audit trail for every agent action:

- **Agent proposes** an action with structured fields (amount, recipient, reason — validated against a configurable schema)
- **Human approves** on Ledger hardware, producing a cryptographic signature
- **LEDGIT executes** the action and records the signed proof on **Hedera HCS** (immutable, ordered, timestamped)
- **ENS name** (e.g. `trader-a.ledgit.eth`) resolves to the complete history — anyone can verify

## Key Features

**Configurable action types.** Define schemas in `.ledgit/config.json` — each type specifies required fields, human-readable templates, and risk levels. The CLI validates every proposal against the schema before it reaches the human. No more inconsistent or incomplete audit entries.

**Standardized by design.** Every action captures the same structure — proposal, signature, consensus timestamp, sequence number. Regulators see a uniform trail regardless of action type.

**Immutable + discoverable.** Hedera HCS guarantees ordering and tamper-proof records. ENS makes the trail findable. Together: you know where to look, and you know the data is authentic.

**Agent-friendly.** `--json` output, tool-call compatible, dynamically discoverable action types via `ledgit actions list`.

**Not a framework plugin.** LEDGIT is a standalone CLI — it sits in front of any agent stack. Call it from Claude, OpenClaw, LangChain, or a bash script. The `--json` flag and discoverable action types make it easy for any agent to consume regardless of provider.

## Example

```bash
ledgit propose --agent trader-a.ledgit.eth --type usdc_transfer --fields '{...}'
ledgit record a1b2c3d4e5f6g7h8
ledgit verify trader-a.ledgit.eth
ledgit dashboard trader-a.ledgit.eth # See every call to propose and record.
```

Agent proposes → Human signs on Ledger → Recorded on HCS → Terminal + web timeline.
