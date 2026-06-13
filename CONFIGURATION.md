Yes — making the set of auditable actions configurable is a great idea. It makes LEDGIT much more flexible and demonstrates thoughtful design.
Recommended Approach (Hackathon-Friendly)
Make it configurable via a simple JSON file (actions.json or .ledgit/config.json).
Example actions.json
JSON{
  "actions": [
    {
      "type": "usdc_transfer",
      "label": "USDC Transfer",
      "descriptionTemplate": "Send {amount} USDC to {to} for {reason}",
      "fields": ["amount", "to", "reason"],
      "riskLevel": "high"
    },
    {
      "type": "token_swap",
      "label": "Token Swap",
      "descriptionTemplate": "Swap {amountIn} {tokenIn} for {tokenOut} on {dex}",
      "fields": ["amountIn", "tokenIn", "tokenOut", "dex"],
      "riskLevel": "high"
    },
    {
      "type": "grant_role",
      "label": "Grant Role",
      "descriptionTemplate": "Grant '{role}' role to {address}",
      "fields": ["role", "address"],
      "riskLevel": "medium"
    },
    {
      "type": "update_agent_config",
      "label": "Update Agent Config",
      "descriptionTemplate": "Update {parameter} to {value}",
      "fields": ["parameter", "value"],
      "riskLevel": "medium"
    }
  ]
}
How It Works in the CLI
Bash# List available actions
ledgit actions list

# Propose using a configured action
ledgit propose \
  --agent trader-a.ledgit.eth \
  --type token_swap \
  --amountIn 5000 \
  --tokenIn USDC \
  --tokenOut ETH \
  --dex Uniswap
LEDGIT will:

Load the config
Auto-generate a clean human-readable description using the template
Validate required fields
Pass everything to Ledger for approval
Record to Hedera HCS with full structured payload

Benefits

Easy to add new action types without changing code
Shows extensibility to judges
Agents can dynamically discover available action types (ledgit actions list --json)
Keeps the core flow unified

Implementation Scope (Low Effort)

Add one loadActionsConfig() function (~30-60 mins)
Update the propose command to accept --type and dynamic fields
Keep it simple for MVP — no need for a fancy schema validator

This enhancement makes LEDGIT feel more production-ready while staying very buildable.
