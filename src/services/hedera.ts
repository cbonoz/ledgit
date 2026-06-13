import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransferTransaction,
  Hbar,
  AccountId,
} from "@hashgraph/sdk"

const HEDERA_NETWORK = process.env.HEDERA_NETWORK || "testnet"

function getClient(): Client {
  const operatorId = process.env.HEDERA_OPERATOR_ID
  const operatorKey = process.env.HEDERA_OPERATOR_KEY
  if (!operatorId || !operatorKey) {
    throw new Error(
      "HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set in .env"
    )
  }
  const client = Client.forName(HEDERA_NETWORK)
  client.setOperator(operatorId, operatorKey)
  return client
}

export async function createTopic(
  memo: string
): Promise<string> {
  const client = getClient()
  const tx = new TopicCreateTransaction()
    .setTopicMemo(memo)
    .setMaxTransactionFee(20_000_000)
  const response = await tx.execute(client)
  const receipt = await response.getReceipt(client)
  const topicId = receipt.topicId!.toString()
  client.close()
  return topicId
}

export async function submitMessage(
  topicId: string,
  message: string
): Promise<{ sequenceNumber: number; timestamp: string }> {
  const client = getClient()
  const tx = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message)
    .setMaxTransactionFee(20_000_000)
  const response = await tx.execute(client)
  const receipt = await response.getReceipt(client)
  const sequenceNumber = receipt.topicSequenceNumber!.toNumber()
  const txRecord = await response.getRecord(client)
  const consensusTimestamp = txRecord.consensusTimestamp!.toString()
  client.close()
  return { sequenceNumber, timestamp: consensusTimestamp }
}

export async function transferHbar(
  toAccountId: string,
  amount: number
): Promise<{ txId: string; status: string; timestamp: string }> {
  const client = getClient()
  const tx = new TransferTransaction()
    .addHbarTransfer(client.operatorAccountId!, new Hbar(-amount))
    .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amount))
    .setMaxTransactionFee(new Hbar(1))
  const response = await tx.execute(client)
  const receipt = await response.getReceipt(client)
  const record = await response.getRecord(client)
  client.close()
  return {
    txId: response.transactionId.toString(),
    status: receipt.status.toString(),
    timestamp: record.consensusTimestamp!.toString(),
  }
}

export async function queryTopicMessages(
  topicId: string,
  limit = 50
): Promise<
  { sequenceNumber: number; consensusTimestamp: string; message: string }[]
> {
  const network = HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet"
  const url = `https://${network}.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=${limit}&order=asc`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Mirror node returned ${res.status}: ${res.statusText}`)
  }

  const body = await res.json() as {
    messages?: {
      sequence_number: number
      consensus_timestamp: string
      message: string
    }[]
  }

  return (body.messages || []).map((m) => ({
    sequenceNumber: m.sequence_number,
    consensusTimestamp: m.consensus_timestamp,
    message: atob(m.message),
  }))
}
