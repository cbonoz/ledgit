# LEDGIT · Rogue Action Demo

> What happens when an agent acts without human approval?

## The Scenario

A trading agent `alice.ledgit.eth` has been executing approved trades all week.
But one afternoon, a misconfigured script or prompt injection causes it to send
a large payment without human review.

Without LEDGIT, this rogue action blends into the logs — good luck proving
whether a human approved it or not.

With LEDGIT, the compliance officer spots the problem instantly.

---

## Step 1: Alice's Approved Actions

```bash
ledgit verify alice.ledgit.eth
```

```
  ── Action #3 ──  🔴 HIGH
  Description: Send 2500 USDC to 0xVendor for invoice payment
  Signature:   0x30c71ccb3787...
  ✅ Ledger Signature Verified   ← human approved

  ── Action #4 ──  🔴 HIGH
  Description: Send 500 USDC to 0xAlice for bonus
  Signature:   0x6bc6e9bff7de...
  ✅ Ledger Signature Verified   ← human approved
```

**Say:** *"Every action so far has a Ledger signature — a human reviewed and
approved each one. The trail is clean."*

---

## Step 2: The Rogue Action (No Human Approval)

Now suppose an agent executes a payment directly without going through LEDGIT —
maybe via a compromised API key or a direct Hedera SDK call.

```bash
# This is what happens OUTSIDE LEDGIT — a direct Hedera transfer without human review
ledgit send 0.0.EVIL_ADDRESS 10000
```

The HBAR moves. No proposal, no Ledger signature, no HCS record.

---

## Step 3: What the Audit Trail Looks Like

When you run `ledgit verify alice.ledgit.eth`, the rogue action either:

- **Doesn't appear at all** — because it was never recorded to the HCS topic
- **Or appears without a signature** — if a bad actor tried to log it

```
  ── Action #3 ──  🔴 HIGH
  Description: Send 2500 USDC to 0xVendor for invoice payment
  Signature:   0x30c71ccb3787...
  ✅ Ledger Signature Verified

  ── Action #4 ──  🔴 HIGH
  Description: Send 500 USDC to 0xAlice for bonus
  Signature:   0x6bc6e9bff7de...
  ✅ Ledger Signature Verified

  ── Action #5 ──  🔴 HIGH
  Description: Send 10000 HBAR to 0xUnknown
  Signature:   ⚠️ NO LEDGER SIGNATURE   ← red flag
```

**Say:** *"The missing signature is obvious. There's no cryptographic proof that a
human authorized this action. The compliance officer flags it immediately."*

---

## Step 4: Containment

```bash
# Revoke the agent's ENS subname to cut off future actions
# (ens-cli generates the calldata, owner signs once)
npx "https://pkg.pr.new/gskril/ens-cli/@ensdomains/cli@main" \
  set text alice.ledgit.eth --key ledgit.hcs.topic --value "" --chain sepolia --json

# Update the HCS topic submit key to block further submissions
# (new topic, new key — old topic stays immutable for forensics)
ledgit init --agent alice.ledgit.eth  # new topic, old one preserved for audit
```

**Say:** *"Because the audit trail is on HCS, the old records are preserved for
investigation. We can't delete or alter them — which is exactly what auditors
want. But we can cut off future access by rotating the topic or revoking the
ENS name."*

---

## The Takeaway

| Aspect | Without LEDGIT | With LEDGIT |
|--------|---------------|-------------|
| Rogue action detection | Buried in logs | Missing signature stands out immediately |
| Proof of authorization | "The agent said so" | Cryptographic proof or obvious absence |
| Incident response | Unclear what happened | Full timeline, know exactly which actions were unauthorized |
| Forensics | Logs can be tampered | HCS records are immutable |

**The bottom line:** LEDGIT doesn't prevent all rogue actions — no tool can.
But it makes them *instantly detectable* and provides an *immutable forensic
record* for investigation. That's what compliance teams need.
