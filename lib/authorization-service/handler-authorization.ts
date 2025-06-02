import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';

export const main = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  const authHeader = event.authorizationToken;

  if (!authHeader) {
    throw new Error("Unauthorized");
  }

  const encodedCreds = authHeader.split(' ')[1];
  const buff = Buffer.from(encodedCreds, 'base64');
  const decodedCreds = buff.toString('utf-8');
  const [username, password] = decodedCreds.split(':');

  const storedPassword = process.env[username];

  if (!storedPassword || storedPassword !== password) {
    throw new Error("Forbidden");
  }

  return {
    principalId: username,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn,
        },
      ],
    },
  };
};
