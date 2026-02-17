import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { create_DB_Table } from "./dynamoDB";
import {
  createAdminCognitoAuthorizer,
  createGuestLambdaAuthorizer,
  createRequestValidator,
  createRestAPI,
  createUserLambdaAuthorizer,
} from "./restApi";
import { createAdminLambdaFns } from "./lambdaFns/admin";
import { createAdminAPIEndPoints } from "./apiEndpoints/admin";
import { createRequestModels } from "./requestModels";
import { createGuestLambdaFns } from "./lambdaFns/guest";
import { createGuestAPIEndPoints } from "./apiEndpoints/guest";
import { createAuthAPIEndPoints } from "./apiEndpoints/auth";
import { createAuthLambdaFns } from "./lambdaFns/auth";
import { createUserLambdaFns } from "./lambdaFns/user";
import { createUserAPIEndPoints } from "./apiEndpoints/user";

export class TemplateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appName = "template";
    const apiStageName = "dev";

    const adminCognitoUserPoolId = "ap-southeast-1_hvjVMW0Gs";

    // DYNAMO DB TABLE
    const dataTable = create_DB_Table(this);

    //#region  REST API
    const restApi = createRestAPI(this, appName, apiStageName);

    //REQUEST MODELS
    const requestModels = createRequestModels(restApi);

    //REQUEST VALIDATOR
    const requestValidator = createRequestValidator(restApi);

    //ADMIN AUTH
    const adminCognitoAuthorizer = createAdminCognitoAuthorizer(
      this,
      adminCognitoUserPoolId
    );

    //LAMBDA FNS
    const adminLambdaFns = createAdminLambdaFns(this, dataTable);
    const guestLambdaFns = createGuestLambdaFns(this, restApi);
    const authLambdaFns = createAuthLambdaFns(this, dataTable);
    const userLambdaFns = createUserLambdaFns(this, restApi, dataTable);

    //GUEST AUTHORIZER
    const guestLambdaAuthorizer = createGuestLambdaAuthorizer(
      this,
      guestLambdaFns.guestAuthFn
    );

    //GUEST AUTHORIZER
    const userLambdaAuthorizer = createUserLambdaAuthorizer(
      this,
      userLambdaFns.userAuthFn
    );

    //ADMIN APIS
    createAdminAPIEndPoints(
      restApi,
      adminLambdaFns,
      adminCognitoAuthorizer,
      requestModels,
      requestValidator
    );

    //GUEST APIS
    createGuestAPIEndPoints(restApi, guestLambdaFns);

    //AUTH APIS
    createAuthAPIEndPoints(
      restApi,
      authLambdaFns,
      guestLambdaAuthorizer,
      requestModels,
      requestValidator
    );

    //USER APIS
    createUserAPIEndPoints(restApi, userLambdaFns, userLambdaAuthorizer);

    //#endregion6ty
  }
}
