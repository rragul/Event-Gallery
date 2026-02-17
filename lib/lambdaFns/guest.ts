import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { createLambdaFnWithRole } from "../utils";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

const createGenerateGuestTokenFn = (scope: Construct) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "generateGuestToken",
    codePath: "functions/guest/generateGuestToken_v2.zip",
    environment: {
      AUD: "guest",
      EXP: "6h",
      ISS: "imi-spin-wheel",
      JWT_SECRET:
        "617960568ec3a4ee23b4f844575bc6f388bfcf9095a983b16448b7bb97fa6f002728becfb8ff623e75046904cca3400d6f7f5121d529e286edef8393588457a2",
    },
    policyStatements: [],
  });

  return fn;
};

const createGuestAuthFn = (scope: Construct, restApi: RestApi) => {
  const fn = createLambdaFnWithRole(scope, {
    fnName: "guestAuth",
    codePath: "functions/guest/guestAuth_v2.zip",
    environment: {
      API_GATEWAY_ARN: `arn:aws:execute-api:${Stack.of(scope).region}:${
        Stack.of(scope).account
      }:${restApi.restApiId}/*`,
      AUD: "guest",
      ISS: "imi-spin-wheel",
      JWT_SECRET:
        "617960568ec3a4ee23b4f844575bc6f388bfcf9095a983b16448b7bb97fa6f002728becfb8ff623e75046904cca3400d6f7f5121d529e286edef8393588457a2",
    },
    policyStatements: [],
  });

  return fn;
};

export const createGuestLambdaFns = (
  scope: Construct,
  restApi: RestApi
): Record<string, IFunction> => {
  const generateGuestTokenFn =
    createGenerateGuestTokenFn(scope);
  const guestAuthFn = createGuestAuthFn(scope, restApi);

  return {
    generateGuestTokenFn,
    guestAuthFn,
  };
};
