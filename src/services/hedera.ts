import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId,
} from "@hashgraph/sdk"

const HEDERA_NETWORK = "testnet"

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

export async function queryTopicMessages(
  topicId: string,
  limit = 50
): Promise<
  { sequenceNumber: number; consensusTimestamp: string; message: string }[]
> {
  const client = getClient()
  const messages: {
    sequenceNumber: number
    consensusTimestamp: string
    message: string
  }[] = []

  await new Promise<void>((resolve, reject) => {
    const query = new TopicMessageQuery()
      .setTopicId(TopicId.fromString(topicId))
      .setLimit(limit)
      .setStartTime(new Date(0))

    query.subscribe(
      client,
      (response) => {
        const message = Buffer.from(response.contents).toString("utf8")
        messages.push({
          sequenceNumber: response.sequenceNumber.toNumber(),
          consensusTimestamp: response.consensusTimestamp.toString(),
          message,
        })
      },
      (error) => {
        reject(error)
      },
      () => {
        resolve()
      }
    )
  })

  client.close()
  return messages
}
