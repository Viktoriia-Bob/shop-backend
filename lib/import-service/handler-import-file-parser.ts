import { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';

const csv = require('csv-parser');

const s3 = new S3();

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
        .on('data', (data: any) => {
          console.log('Parsed record:', data);
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
