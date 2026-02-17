import { Construct } from "constructs";
import { Stack, Duration } from "aws-cdk-lib";
import { Function, Code, Runtime, IFunction } from "aws-cdk-lib/aws-lambda";
import {
  Role,
  Policy,
  PolicyStatement,
  Effect,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  RestApi,
  MethodOptions,
  LambdaIntegration,
  RequestValidator,
} from "aws-cdk-lib/aws-apigateway";

interface CreateLambdaFnWithRoleProps {
  fnName: string;
  codePath: string;
  environment?: Record<string, string>;
  policyStatements?: PolicyStatement[];
}

//CREATE A LAMBDA FN WITH AN ATTACHED IAM ROLE AND CUSTOM POLICY
const createLambdaFnWithRole = (
  scope: Construct,
  props: CreateLambdaFnWithRoleProps
): Function => {
  const { fnName, codePath, environment, policyStatements } = props;

  const roleName = `${fnName}Role`;

  const role = new Role(scope, roleName, {
    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    roleName: roleName,
  });

  const lambdaFn = new Function(scope, fnName, {
    functionName: fnName,
    runtime: Runtime.NODEJS_22_X,
    code: Code.fromAsset(codePath),
    handler: "index.handler",
    environment,
    role,
    timeout: Duration.seconds(10),
  });

  role.attachInlinePolicy(
    new Policy(scope, `${fnName}Policy`, {
      policyName: `${fnName}Policy`,
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["logs:CreateLogGroup"],
          resources: [
            `arn:aws:logs:${Stack.of(scope).region}:${
              Stack.of(scope).account
            }:*`,
          ],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
          resources: [
            `arn:aws:logs:${Stack.of(scope).region}:${
              Stack.of(scope).account
            }:log-group:/aws/lambda/${fnName}:*`,
          ],
        }),
        ...(policyStatements || []),
      ],
    })
  );

  return lambdaFn;
};

const createApiEndpoint = (
  restApi: RestApi,
  path: string,
  method: string,
  lambdaFn: IFunction,
  options: MethodOptions = {}
): void => {
  const integration = new LambdaIntegration(lambdaFn);
  restApi.root.resourceForPath(path).addMethod(method, integration, options);
};

export { createLambdaFnWithRole, createApiEndpoint };
