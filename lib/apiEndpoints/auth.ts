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

const createSignUp_Auth_APIEndPoint = (
  restApi: RestApi,
  lambdaFn: IFunction,
  authorizer: IAuthorizer,
  requestModel: IModel,
  requestValidator: IRequestValidator
): void => {
  createApiEndpoint(
    restApi,
    "auth/signup",
    "POST",
    lambdaFn,
    optionsConfig(authorizer, requestModel, requestValidator)
  );
};

const createLogin_Auth_APIEndPoint = (
  restApi: RestApi,
  lambdaFn: IFunction,
  authorizer: IAuthorizer,
  requestModel: IModel,
  requestValidator: IRequestValidator
): void => {
  createApiEndpoint(
    restApi,
    "auth/login",
    "POST",
    lambdaFn,
    optionsConfig(authorizer, requestModel, requestValidator)
  );
};

const createRefresh_Auth_APIEndPoint = (
  restApi: RestApi,
  lambdaFn: IFunction,
  authorizer: IAuthorizer,
  requestModel: IModel,
  requestValidator: IRequestValidator
): void => {
  createApiEndpoint(
    restApi,
    "auth/refresh",
    "POST",
    lambdaFn,
    optionsConfig(authorizer, requestModel, requestValidator)
  );
};

export const createAuthAPIEndPoints = (
  restApi: RestApi,
  authLambdaFns: Record<string, IFunction>,
  authorizer: IAuthorizer,
  requestModels: Record<string, IModel>,
  requestValidator: IRequestValidator
): void => {
  createSignUp_Auth_APIEndPoint(
    restApi,
    authLambdaFns.signUpFn,
    authorizer,
    requestModels.signupModel,
    requestValidator
  );
  createLogin_Auth_APIEndPoint(
    restApi,
    authLambdaFns.loginFn,
    authorizer,
    requestModels.loginModel,
    requestValidator
  );
  createRefresh_Auth_APIEndPoint(
    restApi,
    authLambdaFns.refreshFn,
    authorizer,
    requestModels.refreshModel,
    requestValidator
  );
};
