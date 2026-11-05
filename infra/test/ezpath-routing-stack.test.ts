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
    GlobalSecondaryIndexes: [
      {
        IndexName: "active-events",
        KeySchema: [
          { AttributeName: "activeKey", KeyType: "HASH" },
          { AttributeName: "effectiveStart", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
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

test("creates the disruption Lambda and event API routes", () => {
  const rendered = template();
  rendered.resourceCountIs("AWS::Lambda::Function", 2);
  rendered.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "python3.12",
    Handler: "handler.lambda_handler",
    MemorySize: 256,
    Timeout: 10,
  });
  rendered.hasResourceProperties("AWS::ApiGatewayV2::Route", {
    RouteKey: "GET /v1/events/active",
    AuthorizationType: "NONE",
  });
  rendered.hasResourceProperties("AWS::ApiGatewayV2::Route", {
    RouteKey: "POST /v1/events",
    AuthorizationType: "JWT",
  });
  rendered.hasResourceProperties("AWS::ApiGatewayV2::Route", {
    RouteKey: "POST /v1/events/{eventId}/resolve",
    AuthorizationType: "JWT",
  });
});

test("creates an MFA-protected Cognito operator pool", () => {
  const rendered = template();
  rendered.hasResourceProperties("AWS::Cognito::UserPool", {
    UserPoolName: "ezpath-operators",
    MfaConfiguration: "ON",
    EnabledMfas: ["SOFTWARE_TOKEN_MFA"],
  });
  rendered.hasResourceProperties("AWS::Cognito::UserPoolClient", {
    GenerateSecret: false,
    PreventUserExistenceErrors: "ENABLED",
  });
  rendered.resourceCountIs("AWS::ApiGatewayV2::Authorizer", 1);
});
