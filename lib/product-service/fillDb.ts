import { Handler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { products } from "./mock-products";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const fillTables: Handler = async () => {
    for (const product of products) {
      await dynamoDB.send(
        new PutItemCommand({
          TableName: "products",
          Item: {
            id: { S: product.id },
            title: { S: product.title },
            description: { S: product.description },
            price: { N: product.price.toString() }
          }
        })
      );
  
      await dynamoDB.send(
        new PutItemCommand({
          TableName: "stock",
          Item: {
            product_id: { S: product.id },
            count: { N: product.count.toString() }
          }
        })
      );
  
      console.log(`Inserted product ${product.title}`);
    }
};