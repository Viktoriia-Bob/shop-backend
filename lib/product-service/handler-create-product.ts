import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCK_TABLE = process.env.STOCK_TABLE!;

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://d2x7im1yk2wi06.cloudfront.net',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'OPTIONS,PUT',
        'Content-Type': 'application/json'
      };

  try {
    const body = JSON.parse(event.body || '{}');
    const { title, description, price, count } = body;

    if (!title || typeof price !== 'number' || typeof count !== 'number') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing or invalid fields' }),
      };
    }

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

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ id, title, description, price, count }),
    };

  } catch (error) {
    console.error('CreateProduct error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
