#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { EventGalleryStack } from "../lib/event-gallery-stack";

const app = new cdk.App();
new EventGalleryStack(app, "EventGalleryStack", {
  env: { account: "191411384525", region: "ap-southeast-1" },
});
