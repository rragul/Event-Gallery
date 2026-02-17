import {
  RestApi,
  Model,
  JsonSchemaVersion,
  JsonSchemaType,
  IModel,
} from "aws-cdk-lib/aws-apigateway";


const createCreatePrizeModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "CreatePrizeModel", {
    restApi,
    contentType: "application/json",
    modelName: "CreatePrizeModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "CreatePrizeModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        name: {
          type: JsonSchemaType.STRING,
        },
        stock: {
          type: JsonSchemaType.INTEGER,
          minimum: 0,
        },
        imageID: {
          type: JsonSchemaType.INTEGER,
          minimum: 0,
        },
      },
      required: ["name", "stock", "imageID"],
      additionalProperties: false,
    },
  });

  return requestModel;
};

const createSignupModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "SignupModel", {
    restApi,
    contentType: "application/json",
    modelName: "SignupModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "SignupModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        mobileNumber: {
          type: JsonSchemaType.STRING,
          pattern: "^[0-9]{10,15}$",
        },
        nickName: {
          type: JsonSchemaType.STRING,
        },
        password: {
          type: JsonSchemaType.STRING,
          minLength: 6,
        },
      },
      required: ["mobileNumber", "nickName", "password"],
      additionalProperties: false,
    },
  });

  return requestModel;
};

const createLoginModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "LoginModel", {
    restApi,
    contentType: "application/json",
    modelName: "LoginModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "LoginModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        mobileNumber: {
          type: JsonSchemaType.STRING,
          pattern: "^[0-9]{10,15}$",
        },
        password: {
          type: JsonSchemaType.STRING,
          minLength: 6,
        },
      },
      required: ["mobileNumber", "password"],
      additionalProperties: false,
    },
  });

  return requestModel;
};

const createRefreshModel = (restApi: RestApi): Model => {
  const requestModel = new Model(restApi, "RefreshModel", {
    restApi,
    contentType: "application/json",
    modelName: "RefreshModel",
    schema: {
      schema: JsonSchemaVersion.DRAFT4,
      title: "RefreshModel",
      type: JsonSchemaType.OBJECT,
      properties: {
        refreshToken: {
          type: JsonSchemaType.STRING,
          minLength: 20,
        },
      },
      required: ["refreshToken"],
      additionalProperties: false,
    },
  });

  return requestModel;
};


export const createRequestModels = (
  restApi: RestApi
): Record<string, IModel> => {
  const createPrizeModel = createCreatePrizeModel(restApi);
  const signupModel = createSignupModel(restApi);
  const loginModel = createLoginModel(restApi);
  const refreshModel = createRefreshModel(restApi);
  return {
    createPrizeModel,
    signupModel,
    loginModel,
    refreshModel
  };
};
