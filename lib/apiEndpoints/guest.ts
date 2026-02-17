import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { createApiEndpoint } from "../utils";

const createGenerateGuestToken_Guest_APIEndPoint = (
  restApi: RestApi,
  lambdaFn: IFunction
): void => {
  createApiEndpoint(restApi, "guest/token", "POST", lambdaFn);
};

export const createGuestAPIEndPoints = (
  restApi: RestApi,
  guestLambdaFns: Record<string, IFunction>
): void => {
  createGenerateGuestToken_Guest_APIEndPoint(
    restApi,
    guestLambdaFns.generateGuestTokenFn
  );
};
