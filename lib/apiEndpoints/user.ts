import {
  RestApi,
  IAuthorizer,
  IRequestValidator,
  IModel,
  AuthorizationType,
  MethodOptions,
} from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { createApiEndpoint } from "../utils";

const optionsConfig = (
  authorizer: IAuthorizer,
  requestModel?: IModel,
  requestValidator?: IRequestValidator
): MethodOptions => ({
  authorizationType: AuthorizationType.CUSTOM,
  authorizer,
  ...(requestModel && {
    requestModels: { "application/json": requestModel },
  }),
  ...(requestValidator && { requestValidator }),
});

const createClaimSpinWheel_User_APIEndPoint = (
  restApi: RestApi,
  lambdaFn: IFunction,
  authorizer: IAuthorizer
): void => {
  createApiEndpoint(
    restApi,
    "user/spin-wheel/spin",
    "POST",
    lambdaFn,
    optionsConfig(authorizer)
  );
};


export const createUserAPIEndPoints = (
  restApi: RestApi,
  userLambdaFns: Record<string, IFunction>,
  authorizer: IAuthorizer
): void => {
  createClaimSpinWheel_User_APIEndPoint(
    restApi,
    userLambdaFns.claimSpinWheelFn,
    authorizer
  );
};
