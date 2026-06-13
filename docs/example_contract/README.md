# Example Contract: Counter

A simple counter contract on Hedera testnet for demonstrating smart contract
interactions via LEDGIT.

## Contract

- **Address:** `0.0.9224072`

### Functions

| Function | Type | Description |
|----------|------|-------------|
| `increment()` | write | Increments the counter by 1 |
| `count()` | read | Returns the current count |

## Usage

```bash
# Increment (writes state, costs gas)
ledgit contract 0.0.9224072 increment '[]'

# View on HashScan
open https://hashscan.io/testnet/contract/0.0.9224072
```

## Redeploy

```bash
bun run deploy-counter
```
