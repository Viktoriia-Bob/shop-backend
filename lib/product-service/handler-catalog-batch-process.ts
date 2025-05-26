import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { SQSEvent } from 'aws-lambda';
import { SNS } from 'aws-sdk';

const sns = new SNS();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCK_TABLE = process.env.STOCK_TABLE!;

export const main = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        try {
            console.log('Processing message:', record.body)
            const body = JSON.parse(record.body);
            const { title, description, price, count } = body;

            const id = uuidv4();

            await client.send(new PutItemCommand({
                TableName: PRODUCTS_TABLE,
                Item: {
                id: { S: id },
                title: { S: title },
                description: { S: description || '' },
                price: { N: price.toString() },
                }
            }));

            await client.send(new PutItemCommand({
                TableName: STOCK_TABLE,
                Item: {
                product_id: { S: id },
                count: { N: count.toString() },
                }
            }));

            console.log(`Product created with ID: ${id}`);
            await sns.publish({
                TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
                Subject: 'New product created',
                Message: `Product ${title} has been successfully added.`,
            }).promise();


        } catch (error) {
            console.error('Error processing message:', record.body, error);
        }
    }
};
