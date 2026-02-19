import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const REGION = process.env.REGION;
export const ddbClient = new DynamoDBClient({ region: REGION });
