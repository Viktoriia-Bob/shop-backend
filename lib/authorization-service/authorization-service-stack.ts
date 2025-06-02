import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from "aws-cdk-lib";
import { join } from 'path';
import { Construct } from "constructs";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    
        const basicAuthorizer = new NodejsFunction(this, "basic-authorizer", {
          runtime: lambda.Runtime.NODEJS_20_X,
          memorySize: 1024,
          timeout: cdk.Duration.seconds(5),
          handler: "main",
          entry: join(__dirname, 'handler-authorization.ts'),
          environment: {
            ViktoriiaBob: process.env['Viktoriia-Bob'] || 'TEST_PASSWORD',
          },
        });

        new cdk.CfnOutput(this, 'BasicAuthorizerLambdaArn', {
            value: basicAuthorizer.functionArn,
            exportName: 'BasicAuthorizerLambdaArn',
        });
    }
}