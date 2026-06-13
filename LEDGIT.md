✅ Here's a polished, ready-to-use one-pager for LEDGIT

LEDGIT
Verifiable Human-Authorized Audit Trails for AI Agents
ETHGlobal New York 2026
What It Is
LEDGIT is a lightweight CLI and agent toolkit that creates cryptographically verifiable audit trails for autonomous AI agent actions.
Every meaningful agent decision is:

Proposed by the agent
Reviewed and signed by a human on a Ledger hardware device
Immutable recorded and ordered on Hedera HCS
Discoverable via a clean ENS agent name

It answers the question every regulated company, fintech, and DAO asks before letting agents touch real money:
“Can you prove a human actually authorized this action?”
The Problem
AI agents are rapidly moving from chat to action — sending payments, executing trades, and interacting with real systems. However, there is currently no trustworthy, tamper-proof way to prove human oversight and create an immutable audit trail. This compliance gap blocks enterprise and regulated adoption of agentic systems.
The Solution
LEDGIT adds a clean compliance layer on top of any agent workflow:

Agent proposes an action (ledgit propose ...)
Human reviews and approves directly on their Ledger device
Signed action is recorded immutably on Hedera HCS (ordered + timestamped)
All actions are linked to an ENS subname (e.g. trader-a.ledgit.eth)

Anyone can resolve the ENS name to view the complete, verifiable history.
Sponsor Stack (3 Sponsors – Clear Roles)

Ledger — Hardware signing for true human-in-the-loop authorization
Hedera — HCS for immutable sequencing, timestamps, and audit records
ENS — Agent identity + discoverable audit trail manifest (subnames + text records)

Demo Flow (2 minutes)

Agent proposes: Send 100 USDC to 0xBob
Human approves on Ledger device (live or emulator)
Action is recorded to Hedera HCS
Run ledgit verify trader-a.ledgit.eth → Clean timeline with signatures and timestamps

Why It Wins

Addresses a real blocker for agent adoption (compliance & auditability)
Clean 3-sponsor integration with distinct, visible contributions
Stands out from “yet another agent” projects — this is infrastructure for safe agents
CLI-first + agent-friendly (easy for Claude/OpenClaw/etc. to call)

Target Users: Fintechs, DAOs, regulated companies deploying treasury, trading, or operations agents.
Tech: Node.js CLI • Ledger Speculos (emulator) • Hedera HCS • ENSjs/viem
Built for: ENS AI Agents Track • Hedera Track • Ledger Track
