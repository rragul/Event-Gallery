import {
  RestApi,
  Model,
  JsonSchemaVersion,
  JsonSchemaType,
  IModel,
} from "aws-cdk-lib/aws-apigateway";

const createHostSignUpModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "HostSignUpModel", {
    restApi,
    contentType: "application/json",
    modelName: "HostSignUpModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "HostSignUpModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        whatsAppNumber: {
          type: JsonSchemaType.STRING,
          pattern: "^\\+?[0-9]{7,15}$",
        },
        password: { type: JsonSchemaType.STRING, minLength: 8 },
        name: { type: JsonSchemaType.STRING, minLength: 2 },
        email: { type: JsonSchemaType.STRING, format: "email" },
      },
      required: ["whatsAppNumber", "password", "name", "email"],
      additionalProperties: false,
    },
  });
  return requestModel;
};

const createHostLoginModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "HostLoginModel", {
    restApi,
    contentType: "application/json",
    modelName: "HostLoginModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "HostLoginModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        whatsAppNumber: {
          type: JsonSchemaType.STRING,
          pattern: "^\\+?[0-9]{7,15}$",
        },
        password: { type: JsonSchemaType.STRING, minLength: 1 },
      },
      required: ["whatsAppNumber", "password"],
      additionalProperties: false,
    },
  });
  return requestModel;
};

const createHostRefreshModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "HostRefreshModel", {
    restApi,
    contentType: "application/json",
    modelName: "HostRefreshModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "HostRefreshModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        refreshToken: { type: JsonSchemaType.STRING, minLength: 20 },
      },
      required: ["refreshToken"],
      additionalProperties: false,
    },
  });
  return requestModel;
};

const createHostVerifyOtpModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "HostVerifyOtpModel", {
    restApi,
    contentType: "application/json",
    modelName: "HostVerifyOtpModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "HostVerifyOtpModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        whatsAppNumber: {
          type: JsonSchemaType.STRING,
          pattern: "^\\+?[0-9]{7,15}$",
        },
        otp: { type: JsonSchemaType.STRING, minLength: 6, maxLength: 6 },
      },
      required: ["whatsAppNumber", "otp"],
      additionalProperties: false,
    },
  });
  return requestModel;
};

export const createRequestModels = (
  restApi: RestApi
): Record<string, IModel> => {
  const hostSignUpModel = createHostSignUpModel(restApi);
  const hostLoginModel = createHostLoginModel(restApi);
  const hostRefreshModel = createHostRefreshModel(restApi);
  const hostVerifyOtpModel = createHostVerifyOtpModel(restApi);
  return {
    hostSignUpModel,
    hostLoginModel,
    hostRefreshModel,
    hostVerifyOtpModel,
  };
};
