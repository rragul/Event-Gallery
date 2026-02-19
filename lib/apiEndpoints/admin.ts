import {
  RestApi,
  IRequestValidator,
  IModel,
} from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export const createAdminAPIEndPoints = (
  restApi: RestApi,
  adminLambdaFns: Record<string, IFunction>,
  requestModels: Record<string, IModel>,
  requestValidator: IRequestValidator
): void => {
  // Placeholder for future admin API endpoints
  // e.g., POST /admin/events, PUT /admin/events/:id, etc.
};
