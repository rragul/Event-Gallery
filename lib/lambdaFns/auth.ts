import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { createLambdaFnWithRole } from "../utils";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction } from "aws-cdk-lib/aws-lambda";

const createSignUpFn = (scope: Construct, dataTable: CfnTable) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "signUp",
    codePath: "functions/auth/signUp_v2.zip",
    environment: {
      REGION: Stack.of(scope).region,
      DYNAMODB_TABLE_NAME: dataTable.tableName!,
      ACC_AUD: "api.imi.app",
      ACC_EXP: "1h",
      ISS: "https://imigames.io",
      REF_AUD: "auth.imi.app",
      REF_EXP: "14d",
      WINS_TOTAL: "100000",
      SPINS_TOTAL: "100000",
      JWT_SECRET:
        "8dfd51ba9f4990ad59449e27055ad93be32ca57ed2d63fd7c1ae3509f8976a6c93b721dc2a4048b27c89580e63c1933b3f7a401105da018476c86f5b030dc93d",
    },
    policyStatements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dynamodb:PutItem"],
        resources: [dataTable.attrArn],
      }),
    ],
  });

  return fn;
};

const createLoginFn = (scope: Construct, dataTable: CfnTable) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "login",
    codePath: "functions/auth/login_v2.zip",
    environment: {
      REGION: Stack.of(scope).region,
      DYNAMODB_TABLE_NAME: dataTable.tableName!,
      ACC_AUD: "api.imi.app",
      ACC_EXP: "1h",
      ISS: "https://imigames.io",
      REF_AUD: "auth.imi.app",
      REF_EXP: "14d",
      JWT_SECRET:
        "8dfd51ba9f4990ad59449e27055ad93be32ca57ed2d63fd7c1ae3509f8976a6c93b721dc2a4048b27c89580e63c1933b3f7a401105da018476c86f5b030dc93d",
    },
    policyStatements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dynamodb:UpdateItem", "dynamodb:GetItem"],
        resources: [dataTable.attrArn],
      }),
    ],
  });

  return fn;
};

const createRefreshFn = (scope: Construct, dataTable: CfnTable) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "refresh",
    codePath: "functions/auth/refresh_v2.zip",
    environment: {
      REGION: Stack.of(scope).region,
      DYNAMODB_TABLE_NAME: dataTable.tableName!,
      ACC_AUD: "api.imi.app",
      ACC_EXP: "1h",
      ISS: "https://imigames.io",
      REF_AUD: "auth.imi.app",
      REF_EXP: "14d",
      JWT_SECRET:
        "8dfd51ba9f4990ad59449e27055ad93be32ca57ed2d63fd7c1ae3509f8976a6c93b721dc2a4048b27c89580e63c1933b3f7a401105da018476c86f5b030dc93d",
    },
    policyStatements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dynamodb:UpdateItem"],
        resources: [dataTable.attrArn],
      }),
    ],
  });

  return fn;
};

export const createAuthLambdaFns = (
  scope: Construct,
  dataTable: CfnTable
): Record<string, IFunction> => {
  const signUpFn = createSignUpFn(scope, dataTable);
  const loginFn = createLoginFn(scope, dataTable);
  const refreshFn = createRefreshFn(scope, dataTable);

  return {
    signUpFn,
    loginFn,
    refreshFn,
  };
};
