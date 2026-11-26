import { SQS_QUEUE_URL, sqsClient } from "@/lib/aws/sqs";
import { scheduleSessionReminder, sendSQSMessage } from "@/queues/sqs.producer";
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

//testDLQ();

async function testScheduler() {
  const fakeSessionTime = new Date(Date.now() + 16 * 60 * 1000);
  const fakeSessionId = "test-scheduler-123";

  console.log(`Creating EventBridge schedule to fire in ~1 minute...`);
  await scheduleSessionReminder(fakeSessionId, fakeSessionTime);
  console.log("Done! Check AWS Console -> EventBridge -> Schedules, and watch your worker terminal in ~60 seconds!");
}

testScheduler();