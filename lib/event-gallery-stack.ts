import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { create_DB_Table } from "./dynamoDB";
import { createRestAPI, createRequestValidator } from "./restApi";
import { createRequestModels } from "./requestModels";
import { createHostLambdaFns } from "./lambdaFns/host";
import { createHostAPIEndPoints } from "./apiEndpoints/host";
import { createAdminLambdaFns } from "./lambdaFns/admin";
import { createAdminAPIEndPoints } from "./apiEndpoints/admin";

export class EventGalleryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appName = "event-gallery";
    const apiStageName = "dev";

    // DYNAMO DB TABLE
    const dataTable = create_DB_Table(this);

    // REST API
    const restApi = createRestAPI(this, appName, apiStageName);

    // REQUEST MODELS
    const requestModels = createRequestModels(restApi);

    // REQUEST VALIDATOR
    const requestValidator = createRequestValidator(restApi);

    // LAMBDA FNS
    const adminLambdaFns = createAdminLambdaFns(this, dataTable);
    const hostLambdaFns = createHostLambdaFns(this, dataTable);

    // ADMIN APIS
    createAdminAPIEndPoints(
      restApi,
      adminLambdaFns,
      requestModels,
      requestValidator
    );

    // HOST APIS (public - no authorizer)
    createHostAPIEndPoints(restApi, hostLambdaFns, requestModels, requestValidator);
  }
}
