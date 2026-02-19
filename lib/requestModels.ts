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
        email: { type: JsonSchemaType.STRING, format: "email" },
        password: { type: JsonSchemaType.STRING, minLength: 8 },
        name: { type: JsonSchemaType.STRING, minLength: 2 },
        phone: { type: JsonSchemaType.STRING, pattern: "^[0-9]{7,15}$" },
      },
      required: ["email", "password", "name", "phone"],
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
        email: { type: JsonSchemaType.STRING, format: "email" },
        password: { type: JsonSchemaType.STRING, minLength: 1 },
      },
      required: ["email", "password"],
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
  return {
    hostSignUpModel,
    hostLoginModel,
  };
};
