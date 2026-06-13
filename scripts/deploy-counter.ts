// Deploy the Counter contract to Hedera testnet
// Usage: bun run deploy-counter

import { Client, ContractCreateTransaction, Hbar, ContractFunctionParameters } from "@hashgraph/sdk"
import { readFileSync, writeFileSync } from "fs"
import { join } from "dirname"

async function main() {
  const client = Client.forName("testnet")
  client.setOperator(process.env.HEDERA_OPERATOR_ID!, process.env.HEDERA_OPERATOR_KEY!)

  const bytecode = Buffer.from(readFileSync(join(__dirname, "..", "docs", "example_contract", "Counter.bin"), "utf8").trim(), "hex")
  console.log("Bytecode:", bytecode.length, "bytes")

  const tx = new ContractCreateTransaction()
    .setBytecode(bytecode)
    .setGas(300_000)
    .setInitialBalance(new Hbar(0))
    .setConstructorParameters(new ContractFunctionParameters())

  const response = await tx.execute(client)
  const receipt = await response.getReceipt(client)
  const contractId = receipt.contractId!.toString()

  const deployInfo = { address: contractId, name: "Counter", network: "testnet", deployedAt: new Date().toISOString() }
  writeFileSync(join(__dirname, "..", "docs", "example_contract", "Counter.deploy.json"), JSON.stringify(deployInfo, null, 2) + "\n")
  console.log("Deployed:", contractId)
  console.log("HashScan:", `https://hashscan.io/testnet/contract/${contractId}`)
  client.close()
}

main().catch(console.error)
