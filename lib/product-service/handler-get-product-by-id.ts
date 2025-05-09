import { products } from './mock-products';

export async function main(event: any) {
    const { productId } = event.pathParameters || {};
    const product = products.find(p => p.id === productId);
  
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Product not found" }),
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  
    return {
      statusCode: 200,
      body: JSON.stringify(product),
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    };
}
  