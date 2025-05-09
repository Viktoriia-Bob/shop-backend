import { products } from './mock-products';

export async function main() {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://d2x7im1yk2wi06.cloudfront.net',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(products),
  };
}
