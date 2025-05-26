import { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

const csv = require('csv-parser');

const s3 = new S3();
const sqs = new SQSClient({});
const catalogItemsQueueUrl = process.env.CATALOG_ITEMS_QUEUE_URL!;

export const main = async (event: S3Event): Promise<void> => {
  console.log('S3 Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const params = { Bucket: bucket, Key: key };
    const s3Stream = s3.getObject(params).createReadStream();

    await new Promise<void>((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', async (data: any) => {
          try {
            await sqs.send(new SendMessageCommand({
              QueueUrl: catalogItemsQueueUrl,
              MessageBody: JSON.stringify(data),
            }));
          } catch (err) {
            console.error('Error sending message to SQS:', err);
          }
        })
        .on('end', () => {
          console.log('CSV parsing finished.');
          resolve();
        })
        .on('error', (err: any) => {
          console.error('CSV parsing error:', err);
          reject(err);
        });
    });
  }
};
