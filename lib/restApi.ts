import {
  EndpointType,
  RestApi,
  CognitoUserPoolsAuthorizer,
  RequestValidator,
  TokenAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";

const createRestAPI = (
  scope: Construct,
  appName: string,
  apiStageName: string
) => {
  // CREATE THE REST API
  const restApiName = `${appName}`;

  const restApi = new RestApi(scope, restApiName, {
    restApiName: restApiName,
    deployOptions: {
      stageName: apiStageName,
    },
    defaultCorsPreflightOptions: {
      allowOrigins: ["*"], // Replace with specific origins as needed
      allowMethods: ["OPTIONS", "POST", "GET", "PUT", "DELETE"], // Specify methods your API supports
    },
    endpointConfiguration: {
      types: [EndpointType.REGIONAL], // 👈 Make API regional
    },
  });

  return restApi;
};

const createRequestValidator = (restApi: RestApi): RequestValidator => {
  return new RequestValidator(restApi, "RequestValidator", {
    restApi,
    requestValidatorName: "RequestValidator",
    validateRequestBody: true,
  });
};

const createAdminCognitoAuthorizer = (
  scope: Construct,
  cognitoUserPoolId: string
): CognitoUserPoolsAuthorizer => {
  const authorizerName = "AdminAuth";

  // IMPORT THE EXISTING USER POOL
  const userPool = UserPool.fromUserPoolId(
    scope,
    "AdminUserPool",
    cognitoUserPoolId
  );

  // COGNITO AUTHORIZER
  const authorizer = new CognitoUserPoolsAuthorizer(scope, authorizerName, {
    cognitoUserPools: [userPool],
    authorizerName: authorizerName,
  });

  return authorizer;
};

const createGuestLambdaAuthorizer = (
  scope: Construct,
  lambdaAuthorizerFn: IFunction
): TokenAuthorizer => {
  const authorizerName = "GuestAuth";

  const authorizer = new TokenAuthorizer(scope, authorizerName, {
    authorizerName: authorizerName,
    handler: lambdaAuthorizerFn,
    identitySource: "method.request.header.Authorization", // typically where token is sent
    resultsCacheTtl: Duration.seconds(0), //disables caching
  });

  return authorizer;
};

const createUserLambdaAuthorizer = (
  scope: Construct,
  lambdaAuthorizerFn: IFunction
): TokenAuthorizer => {
  const authorizerName = "UserAuth";

  const authorizer = new TokenAuthorizer(scope, authorizerName, {
    authorizerName: authorizerName,
    handler: lambdaAuthorizerFn,
    identitySource: "method.request.header.Authorization", // typically where token is sent
    resultsCacheTtl: Duration.seconds(0), //disables caching
  });

  return authorizer;
};

export {
  createRestAPI,
  createAdminCognitoAuthorizer,
  createRequestValidator,
  createGuestLambdaAuthorizer,
  createUserLambdaAuthorizer,
};
