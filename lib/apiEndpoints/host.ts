import {
    RestApi,
    IRequestValidator,
    IModel,
} from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { createApiEndpoint } from "../utils";

const createHostSignUp_APIEndPoint = (
    restApi: RestApi,
    lambdaFn: IFunction,
    requestModel: IModel,
    requestValidator: IRequestValidator
): void => {
    createApiEndpoint(restApi, "host/signup", "POST", lambdaFn, {
        requestModels: { "application/json": requestModel },
        requestValidator,
    });
};

const createHostLogin_APIEndPoint = (
    restApi: RestApi,
    lambdaFn: IFunction,
    requestModel: IModel,
    requestValidator: IRequestValidator
): void => {
    createApiEndpoint(restApi, "host/login", "POST", lambdaFn, {
        requestModels: { "application/json": requestModel },
        requestValidator,
    });
};

const createHostRefresh_APIEndPoint = (
    restApi: RestApi,
    lambdaFn: IFunction,
    requestModel: IModel,
    requestValidator: IRequestValidator
): void => {
    createApiEndpoint(restApi, "host/refresh", "POST", lambdaFn, {
        requestModels: { "application/json": requestModel },
        requestValidator,
    });
};

export const createHostAPIEndPoints = (
    restApi: RestApi,
    hostLambdaFns: Record<string, IFunction>,
    requestModels: Record<string, IModel>,
    requestValidator: IRequestValidator
): void => {
    createHostSignUp_APIEndPoint(
        restApi,
        hostLambdaFns.hostSignUpFn,
        requestModels.hostSignUpModel,
        requestValidator
    );
    createHostLogin_APIEndPoint(
        restApi,
        hostLambdaFns.hostLoginFn,
        requestModels.hostLoginModel,
        requestValidator
    );
    createHostRefresh_APIEndPoint(
        restApi,
        hostLambdaFns.hostRefreshFn,
        requestModels.hostRefreshModel,
        requestValidator
    );
};
