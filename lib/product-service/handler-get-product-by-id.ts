import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCK_TABLE = process.env.STOCK_TABLE!;

export const main = async (event: any) => {
  const { productId } = event.pathParameters || {};

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing productId" }),
    };
  }

  try {
    const productResponse = await client.send(new GetItemCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: { S: productId } },
    }));

    const stockResponse = await client.send(new GetItemCommand({
      TableName: STOCK_TABLE,
      Key: { product_id: { S: productId } },
    }));

    const product = productResponse.Item;
    const stock = stockResponse.Item;

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Product not found" }),
      };
    }

    const result = {
      id: product.id.S!,
      title: product.title.S!,
      description: product.description.S!,
      price: Number(product.price.N!),
      count: stock ? Number(stock.count.N!) : 0
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://d2x7im1yk2wi06.cloudfront.net',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error getting product by ID:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch product" }),
    };
  }
};