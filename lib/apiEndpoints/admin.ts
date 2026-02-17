import {
  RestApi,
  AuthorizationType,
  MethodOptions,
  IAuthorizer,
  IRequestValidator,
  IModel,
} from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { createApiEndpoint } from "../utils";

const optionsConfig = (
  authorizer: IAuthorizer,
  requestModel?: IModel,
  requestValidator?: IRequestValidator
): MethodOptions => ({
  authorizationType: AuthorizationType.COGNITO,
  authorizer,
  authorizationScopes: ["openid"],
  ...(requestModel && {
    requestModels: { "application/json": requestModel },
  }),
  ...(requestValidator && { requestValidator }),
});

const createCreatePrize_Admin_APIEndPoint = (
  restApi: RestApi,
  lambdaFn: IFunction,
  authorizer: IAuthorizer,
  requestModel: IModel,
  requestValidator: IRequestValidator
): void => {
  createApiEndpoint(
    restApi,
    "admin/spin-wheel/prize",
    "POST",
    lambdaFn,
    optionsConfig(authorizer, requestModel, requestValidator)
  );
};


export const createAdminAPIEndPoints = (
  restApi: RestApi,
  adminLambdaFns: Record<string, IFunction>,
  authorizer: IAuthorizer,
  requestModels: Record<string, IModel>,
  requestValidator: IRequestValidator
): void => {
  createCreatePrize_Admin_APIEndPoint(
    restApi,
    adminLambdaFns.createPrizeFn,
    authorizer,
    requestModels.createPrizeModel,
    requestValidator
  );
};
