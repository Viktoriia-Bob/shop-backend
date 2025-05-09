import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { join } from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = dynamodb.Table.fromTableName(this, "products", "products");
    const stockTable = dynamodb.Table.fromTableName(this, "stock", "stock");

    const addTestExamples = new NodejsFunction(this, 'add-test-examples', {
          runtime: lambda.Runtime.NODEJS_20_X,
          memorySize: 1024,
          timeout: cdk.Duration.seconds(5),
          handler: 'fillTables',
          entry: join(__dirname, 'fillDb.ts'),
    });

    productsTable.grantWriteData(addTestExamples);
    stockTable.grantWriteData(addTestExamples);

    const getProductsListLambda = new NodejsFunction(this, 'get-products-list', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'main',
      entry: join(__dirname, 'handler-get-products.ts'),
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCK_TABLE: stockTable.tableName,
      },
    });

    productsTable.grantReadData(getProductsListLambda);
    stockTable.grantReadData(getProductsListLambda);

    const getProductByIdLambda = new NodejsFunction(this, 'get-product-by-id', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'main',
      entry: join(__dirname, 'handler-get-product-by-id.ts'),
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCK_TABLE: stockTable.tableName,
      },
    });

    productsTable.grantReadData(getProductByIdLambda);
    stockTable.grantReadData(getProductByIdLambda);

    const createProductLambda = new NodejsFunction(this, 'create-product', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'main',
      entry: join(__dirname, 'handler-create-product.ts'),
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCK_TABLE: stockTable.tableName,
      },
    });

    productsTable.grantWriteData(createProductLambda);
    stockTable.grantWriteData(createProductLambda);

    const api = new apigateway.RestApi(this, "product-api", {
      restApiName: "Product Service",
      description: "This API handles product requests."
    });

    const productResource = api.root.addResource("product");

    productResource.addMethod('PUT', new apigateway.LambdaIntegration(createProductLambda, {
      proxy: true
    }), {
      methodResponses: [{ statusCode: '201' }, { statusCode: '400' }, { statusCode: '500' }]
    });

    productResource.addCorsPreflight({
      allowOrigins: ['https://d2x7im1yk2wi06.cloudfront.net'],
      allowMethods: ['PUT'],
      allowHeaders: ['Content-Type', 'Authorization']
    });

    const productListResource = productResource.addResource("available");

    productListResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda, {
      proxy: true,
      integrationResponses: [
        { statusCode: '200' }
      ]
    }), {
      methodResponses: [{ statusCode: '200' }, { statusCode: '500' }]
    });

    productListResource.addCorsPreflight({
      allowOrigins: ['https://d2x7im1yk2wi06.cloudfront.net', 'https://d2x7im1yk2wi06.cloudfront.net/*'],
      allowMethods: ['GET'],
    });

    const productByIdResource = productResource.addResource("{productId}");

    productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductByIdLambda, {
      proxy: true,
      integrationResponses: [{ statusCode: '200' }]
    }), {
      methodResponses: [{ statusCode: '200' }, { statusCode: '404' }, { statusCode: '500' }]
    });

    productByIdResource.addCorsPreflight({
      allowOrigins: ['https://d2x7im1yk2wi06.cloudfront.net', 'https://d2x7im1yk2wi06.cloudfront.net/*'],
      allowMethods: ['GET'],
    });
  }
}
