import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { createLambdaFnWithRole } from "../utils";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export const createAdminLambdaFns = (
  scope: Construct,
  dataTable: CfnTable
): Record<string, IFunction> => {
  // Placeholder for future admin Lambda functions
  // e.g., createEvent, updateEvent, deleteEvent, etc.
  return {};
};
