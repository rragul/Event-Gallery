import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { createLambdaFnWithRole } from "../utils";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

const createUserAuthFn = (scope: Construct, restApi: RestApi) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "userAuth",
    codePath: "functions/user/userAuth_v2.zip",
    environment: {
      ACC_AUD: "api.imi.app",
      API_GATEWAY_ARN: `arn:aws:execute-api:${Stack.of(scope).region}:${
        Stack.of(scope).account
      }:${restApi.restApiId}/*`,
      ISS: "https://imigames.io",
      JWT_SECRET:
        "8dfd51ba9f4990ad59449e27055ad93be32ca57ed2d63fd7c1ae3509f8976a6c93b721dc2a4048b27c89580e63c1933b3f7a401105da018476c86f5b030dc93d",
    },
    policyStatements: [],
  });

  return fn;
};

const createClaimSpinWheelFn = (scope: Construct, dataTable: CfnTable) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "claimSpinWheel",
    codePath: "functions/user/claimSpinWheel_v2.zip",
    environment: {
      REGION: Stack.of(scope).region,
      DYNAMODB_TABLE_NAME: dataTable.tableName!,
      LOCK_TIME_LIMIT: "30000",
    },
    policyStatements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
        ],
        resources: [dataTable.attrArn],
      }),
    ],
  });

  return fn;
};

export const createUserLambdaFns = (
  scope: Construct,
  restApi: RestApi,
  dataTable: CfnTable
): Record<string, IFunction> => {
  const userAuthFn = createUserAuthFn(scope, restApi);
  const claimSpinWheelFn = createClaimSpinWheelFn(scope, dataTable);

  return {
    userAuthFn,
    claimSpinWheelFn,
  };
};
