import assert from "node:assert/strict";
import test from "node:test";
import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { EzPathRoutingStack } from "../lib/ezpath-routing-stack";

function template(): Template {
  const app = new App();
  const stack = new EzPathRoutingStack(app, "TestEzPathRoutingStack");
  return Template.fromStack(stack);
}

test("creates an encrypted versioned graph bucket", () => {
  template().hasResourceProperties("AWS::S3::Bucket", {
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        { ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } },
      ],
    },
    VersioningConfiguration: { Status: "Enabled" },
  });
});

test("creates the live-status table with TTL and point-in-time recovery", () => {
  template().hasResourceProperties("AWS::DynamoDB::Table", {
    BillingMode: "PAY_PER_REQUEST",
    PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
    TimeToLiveSpecification: { AttributeName: "expiresAt", Enabled: true },
  });
});

test("creates the ZIP-based Python Lambda and both HTTP routes", () => {
  const rendered = template();
  rendered.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "python3.12",
    Handler: "handler.lambda_handler",
    MemorySize: 2048,
    Timeout: 30,
  });
  rendered.hasResourceProperties("AWS::ApiGatewayV2::Route", { RouteKey: "GET /health" });
  rendered.hasResourceProperties("AWS::ApiGatewayV2::Route", { RouteKey: "POST /v1/routes" });
  assert.ok(rendered.toJSON());
});
