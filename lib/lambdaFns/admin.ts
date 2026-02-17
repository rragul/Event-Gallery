import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { createLambdaFnWithRole } from "../utils";
import { IFunction } from "aws-cdk-lib/aws-lambda";

const createCreatePrizeFn = (
  scope: Construct,
  dataTable: CfnTable
) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "createPrize",
    codePath: "functions/admin/createPrize_v2.zip",
    environment: {
      REGION: Stack.of(scope).region,
      DYNAMODB_TABLE_NAME: dataTable.tableName!,
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

export const createAdminLambdaFns = (
  scope: Construct,
  dataTable: CfnTable
): Record<string, IFunction> => {

  const createPrizeFn = createCreatePrizeFn(scope, dataTable);

  return {
    createPrizeFn
  };
};
