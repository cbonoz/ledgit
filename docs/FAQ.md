# LEDGIT · FAQ

## 1. Do I need an ENS name to use LEDGIT?
No. Without an ENS name, set `LEDGIT_TOPIC_ID` in `.env` and it works the same way. ENS just makes verification self-discoverable — anyone can resolve the name instead of passing around a topic ID.

## 2. Do I need a Ledger device?
For high and medium risk actions, yes — that's the point. Low-risk actions skip hardware. If you don't have a Ledger, you can still use low-risk actions for development, or the CLI falls back to software signing. But for the full human-in-the-loop demo, a Ledger is needed.

## 3. Does this cost real money?
Everything runs on Hedera testnet with free HBAR from the portal. The Counter contract is on testnet. ENS names are on Sepolia (testnet). No real funds required.

## 4. Can I use mainnet?
The code is ready — `HEDERA_NETWORK=mainnet` and `network.ens: "mainnet"` in config. HashScan and mirror node URLs auto-switch. But the demo was built and tested on testnet.

## 5. Why two Ledger prompts (HBAR + contract)?
Each action is reviewed independently on the device. The human sees and approves every high/medium risk action one at a time. This is intentional — you don't want blind batch approvals.

## 6. Can I add custom action types?
Yes — edit `.ledgit/config.json` or run `ledgit actions init-config` to create the file. Each action type has a type name, label, description template, fields, and risk level. The schema auto-updates when you run `ledgit tools schema`.

## 7. How do I verify a signature?
Run `ledgit verify-sig <action-id> --agent <name>`. This recovers the signer's Ethereum address from the Ledger signature using `recoverMessageAddress` from viem. Software-generated signatures (low risk) show a note instead.

## 8. What happens if an agent sends a transaction outside LEDGIT?
It won't appear in the audit trail. The dashboard shows `⚠️ Missing Signature` for high-risk actions without a Ledger signature. The rogue action is visible on HCS but flagged as unverified.

## 9. Can multiple agents share one HCS topic?
Yes — set the same topic ID for each agent in `.ledgit/config.json`. Each action records the agent name so the trail is filterable. Alternatively, each agent gets their own topic for full isolation.

## 10. How is encryption handled?
Set `ENCRYPTION_KEY` (64 hex chars) in `.env`. Actions submitted after that are encrypted with AES-256-GCM before HCS submission. Sequence numbers and timestamps remain public; content is private to key holders. The dashboard shows `🔒 Encrypted` if the key isn't available.
