import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { join } from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'uploaded', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
            allowedOrigins: ['https://d2x7im1yk2wi06.cloudfront.net', 'https://d2x7im1yk2wi06.cloudfront.net/*'],
            allowedMethods: [
                s3.HttpMethods.PUT,
                s3.HttpMethods.GET,
                s3.HttpMethods.HEAD,
            ],
            allowedHeaders: ['*'],
        },
      ],
    });

    const importProductsFile = new NodejsFunction(this, 'import-products-file', {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: 'main',
        entry: join(__dirname, 'handler-import-products.ts'),
        environment: {
            BUCKET_NAME: bucket.bucketName,
        }
    });

    bucket.grantPut(importProductsFile);

    const importFileParser = new NodejsFunction(this, 'import-file-parser', {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(10),
        handler: 'main',
        entry: join(__dirname, 'handler-import-file-parser.ts'),
        environment: {
            BUCKET_NAME: bucket.bucketName,
        }
    });

    bucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3n.LambdaDestination(importFileParser),
        { prefix: 'uploaded/' }
    );

    bucket.grantRead(importFileParser);


    const api = new apigateway.RestApi(this, "import-api", {
          restApiName: "Import Service",
    });

    const importProductsResource = api.root.addResource('import');

    importProductsResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFile, {
        proxy: true,
        integrationResponses: [{ statusCode: '200' }]
    }), {
        methodResponses: [{ statusCode: '200'}, { statusCode: '400' }, { statusCode: '500' }]
    });

    importProductsResource.addCorsPreflight({
        allowOrigins: ['https://d2x7im1yk2wi06.cloudfront.net', 'https://d2x7im1yk2wi06.cloudfront.net/*'],
        allowMethods: ['GET'],
    });
  }
}