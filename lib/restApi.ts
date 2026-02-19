import {
  EndpointType,
  RestApi,
  RequestValidator,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export const createRestAPI = (
  scope: Construct,
  appName: string,
  apiStageName: string
) => {
  const restApiName = `${appName}`;

  const restApi = new RestApi(scope, restApiName, {
    restApiName: restApiName,
    deployOptions: {
      stageName: apiStageName,
    },
    defaultCorsPreflightOptions: {
      allowOrigins: ["*"],
      allowMethods: ["OPTIONS", "POST", "GET", "PUT", "DELETE"],
    },
    endpointConfiguration: {
      types: [EndpointType.REGIONAL],
    },
  });

  return restApi;
};

export const createRequestValidator = (restApi: RestApi): RequestValidator => {
  return new RequestValidator(restApi, "RequestValidator", {
    restApi,
    requestValidatorName: "RequestValidator",
    validateRequestBody: true,
  });
};
