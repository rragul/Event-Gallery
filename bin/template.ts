#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TemplateStack } from "../lib/template-stack";

const app = new cdk.App();
new TemplateStack(app, "TemplateStack", {
  env: { account: "aws-account-id", region: "ap-southeast-1" },
});
