import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

const create_DB_Table = (scope: Construct): CfnTable => {
  const tableName = "EventGallery-DB";

  const table = new CfnTable(scope, tableName, {
    tableName,
    attributeDefinitions: [
      {
        attributeName: "PK", // Partition Key
        attributeType: "S", // String
      },
      {
        attributeName: "SK", // Sort Key
        attributeType: "S", // String
      },
    ],
    keySchema: [
      {
        attributeName: "PK", // Partition Key
        keyType: "HASH", // Hash key
      },
      {
        attributeName: "SK", // Sort Key
        keyType: "RANGE", // Range key
      },
    ],
    billingMode: "PAY_PER_REQUEST", // On-demand billing
  });

  return table;
};

export { create_DB_Table };
