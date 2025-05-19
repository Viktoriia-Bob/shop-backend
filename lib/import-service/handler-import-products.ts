import { S3 } from 'aws-sdk';

const s3 = new S3({ region: process.env.AWS_REGION });

export const main = async (event: any) => {
  console.log('Event:', event);

  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://d2x7im1yk2wi06.cloudfront.net',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ message: 'Missing file name' }),
    };
  }

  const params = {
    Bucket: process.env.BUCKET_NAME!,
    Key: `uploaded/${fileName}`,
    Expires: 60,
    ContentType: 'text/csv',
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise('putObject', params);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://d2x7im1yk2wi06.cloudfront.net',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify(signedUrl),
    };
  } catch (error) {
    console.error('Error generating signed URL', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://d2x7im1yk2wi06.cloudfront.net',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ message: 'Failed to generate signed URL' }),
    };
  }
};
