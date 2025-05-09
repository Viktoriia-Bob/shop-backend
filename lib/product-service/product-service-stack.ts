import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListLambda = new lambda.Function(this, 'get-products-list', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'handler-get-products.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    });

    const getProductByIdLambda = new lambda.Function(this, 'get-product-by-id', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'handler-get-product-by-id.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    });

    const api = new apigateway.RestApi(this, "product-api", {
      restApiName: "Product Service",
      description: "This API handles product requests."
    });

    const productResource = api.root.addResource("product");

    const productListResourse = productResource.addResource("available");


    productListResourse.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda, {
      integrationResponses: [{ statusCode: '200' }],
      proxy: true,
    }), {
      methodResponses: [{ statusCode: '200' }]
    });

    productListResourse.addCorsPreflight({
      allowOrigins: ['https://d2x7im1yk2wi06.cloudfront.net', 'https://d2x7im1yk2wi06.cloudfront.net/*'],
      allowMethods: ['GET'],
    });

    const productByIdResource = productResource.addResource("{productId}");

    productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductByIdLambda, {
      integrationResponses: [{ statusCode: '200' }],
      proxy: true,
    }), {
      methodResponses: [{ statusCode: '200' }]
    });

    productByIdResource.addCorsPreflight({
      allowOrigins: ['https://d2x7im1yk2wi06.cloudfront.net', 'https://d2x7im1yk2wi06.cloudfront.net/*'],
      allowMethods: ['GET'],
    });
  }
}
