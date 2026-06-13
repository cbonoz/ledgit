# LEDGIT

> The auditability CLI for named agents. Prove a human authorized every action.

A CLI-first tool that creates cryptographically verifiable audit trails for AI agent actions using **Ledger** (signing), **Hedera HCS** (immutable records), and **ENS** (identity + discovery).

## Install

```bash
# Clone and install deps
git clone https://github.com/cbonoz/ledgit.git
cd ledgit
bun install

# Install globally
npm link
# Now `ledgit` is available from anywhere
```

## Quick Demo

```bash
# See available action types
ledgit actions list

# Agent proposes a trade
ledgit propose --agent trader-a.ledgit.eth --type token_swap --fields '...'

# Human approves on Ledger → recorded to HCS
ledgit record <action-id>

# View the audit trail
ledgit verify trader-a.ledgit.eth

# Open web dashboard
ledgit dashboard trader-a.ledgit.eth

# Send real HBAR
ledgit send 0.0.RECIPIENT 1
```

## Commands

| Command | Description |
|---------|-------------|
| `ledgit propose` | Agent proposes an action with structured fields |
| `ledgit record` | Human signs on Ledger → recorded to HCS |
| `ledgit verify` | Display ordered audit trail from HCS |
| `ledgit dashboard` | Open visual timeline in browser |
| `ledgit init` | Create HCS topic for an agent |
| `ledgit send` | Execute HBAR transfer on Hedera |
| `ledgit actions list` | Discover available action types |

## Why This Exists

AI agents are moving real money, but regulated companies cannot deploy them without answering: *"Can you prove a human authorized this?"* LEDGIT provides the answer — every single time — with cryptographic proof, immutable ordering, and self-discoverable identity.

## Sponsors

Built for **ETHGlobal New York 2026** — **Ledger**, **Hedera**, and **ENS** tracks.
