import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { createLambdaFnWithRole } from "../utils";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction } from "aws-cdk-lib/aws-lambda";

const JWT_SECRET =
    "8dfd51ba9f4990ad59449e27055ad93be32ca57ed2d63fd7c1ae3509f8976a6c93b721dc2a4048b27c89580e63c1933b3f7a401105da018476c86f5b030dc93d";

const createHostSignUpFn = (scope: Construct, dataTable: CfnTable) => {
    const fn = createLambdaFnWithRole(scope, {
        fnName: "hostSignUp",
        codePath: "functions/host/hostSignUp",
        environment: {
            REGION: Stack.of(scope).region,
            DYNAMODB_TABLE_NAME: dataTable.tableName!,
            ACC_AUD: "host.event-gallery.app",
            ACC_EXP: "8h",
            ISS: "https://event-gallery.app",
            REF_AUD: "host-refresh.event-gallery.app",
            REF_EXP: "30d",
            JWT_SECRET,
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

const createHostLoginFn = (scope: Construct, dataTable: CfnTable) => {
    const fn = createLambdaFnWithRole(scope, {
        fnName: "hostLogin",
        codePath: "functions/host/hostLogin",
        environment: {
            REGION: Stack.of(scope).region,
            DYNAMODB_TABLE_NAME: dataTable.tableName!,
            ACC_AUD: "host.event-gallery.app",
            ACC_EXP: "8h",
            ISS: "https://event-gallery.app",
            REF_AUD: "host-refresh.event-gallery.app",
            REF_EXP: "30d",
            JWT_SECRET,
        },
        policyStatements: [
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ["dynamodb:GetItem", "dynamodb:UpdateItem"],
                resources: [dataTable.attrArn],
            }),
        ],
    });

    return fn;
};

export const createHostLambdaFns = (
    scope: Construct,
    dataTable: CfnTable
): Record<string, IFunction> => {
    const hostSignUpFn = createHostSignUpFn(scope, dataTable);
    const hostLoginFn = createHostLoginFn(scope, dataTable);

    return {
        hostSignUpFn,
        hostLoginFn,
    };
};
