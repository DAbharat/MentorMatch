import { SQS_QUEUE_URL, sqsClient } from "@/lib/aws/sqs";
import { sendSQSMessage } from "@/queues/sqs.producer";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

async function test() {
  console.log("Sending test message to AWS SQS...");
  
  const messageId = await sendSQSMessage("compute-session-metrics", {
    sessionId: "test-session-123",
  });

  console.log(`Successfully sent message to AWS! MessageId: ${messageId}`);
}

//test();

async function testDLQ() {
  console.log("Sending a broken task to test SQS Retries & DLQ...");

  const response = await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        task: "broken-dlq-test",
        payload: { reason: "Testing Dead-Letter Queue redrive" },
        timestamp: Date.now(),
      }),
    })
  );

  console.log(`Message sent! MessageId: ${response.MessageId}`);
  console.log("Watch your worker terminal over the next ~90 seconds...");
}

testDLQ();