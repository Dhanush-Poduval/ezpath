import * as path from "node:path";
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Size,
  Stack,
  StackProps,
  aws_apigatewayv2 as apigatewayv2,
  aws_cloudwatch as cloudwatch,
  aws_cognito as cognito,
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
  aws_logs as logs,
  aws_s3 as s3,
} from "aws-cdk-lib";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { Construct } from "constructs";

export class EzPathRoutingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const graphBucket = new s3.Bucket(this, "GraphBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const statusTable = new dynamodb.Table(this, "StatusTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      timeToLiveAttribute: "expiresAt",
      removalPolicy: RemovalPolicy.RETAIN,
    });
    statusTable.addGlobalSecondaryIndex({
      indexName: "active-events",
      partitionKey: { name: "activeKey", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "effectiveStart", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const operatorUserPool = new cognito.UserPool(this, "OperatorUserPool", {
      userPoolName: "ezpath-operators",
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: { sms: false, otp: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    const operatorClient = operatorUserPool.addClient("OperatorWebClient", {
      authFlows: { userSrp: true },
      generateSecret: false,
      preventUserExistenceErrors: true,
    });

    const repositoryRoot = path.resolve(__dirname, "..", "..", "..");
    const routePackage = path.join(repositoryRoot, ".build", "route_lambda");
    const routeFunction = new lambda.Function(this, "RouteFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handler.lambda_handler",
      code: lambda.Code.fromAsset(routePackage),
      architecture: lambda.Architecture.X86_64,
      description: "Deterministic accessibility-aware routing service",
      environment: {
        EZPATH_GRAPH_BUCKET: graphBucket.bucketName,
        EZPATH_GRAPH_KEY: "graphs/campus.graphml",
        EZPATH_GRAPH_PATH: "/tmp/ezpath/campus.graphml",
        EZPATH_STATUS_TABLE: statusTable.tableName,
      },
      ephemeralStorageSize: Size.mebibytes(1024),
      memorySize: 2048,
      timeout: Duration.seconds(30),
      logGroup: new logs.LogGroup(this, "RouteFunctionLogs", {
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    });

    graphBucket.grantRead(routeFunction);
    statusTable.grantReadData(routeFunction);

    const disruptionPackage = path.join(repositoryRoot, ".build", "disruption_lambda");
    const disruptionFunction = new lambda.Function(this, "DisruptionFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handler.lambda_handler",
      code: lambda.Code.fromAsset(disruptionPackage),
      architecture: lambda.Architecture.X86_64,
      description: "Live accessibility disruption event service",
      environment: {
        EZPATH_STATUS_TABLE: statusTable.tableName,
      },
      memorySize: 256,
      timeout: Duration.seconds(10),
      logGroup: new logs.LogGroup(this, "DisruptionFunctionLogs", {
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    });
    statusTable.grantReadWriteData(disruptionFunction);

    const httpApi = new apigatewayv2.HttpApi(this, "HttpApi", {
      apiName: "ezpath-routing-api",
      corsPreflight: {
        allowHeaders: ["authorization", "content-type"],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ["http://localhost:3000"],
        maxAge: Duration.hours(1),
      },
    });
    const routeIntegration = new HttpLambdaIntegration("RouteIntegration", routeFunction);
    const disruptionIntegration = new HttpLambdaIntegration(
      "DisruptionIntegration",
      disruptionFunction,
    );
    const operatorAuthorizer = new HttpJwtAuthorizer(
      "OperatorAuthorizer",
      `https://cognito-idp.${this.region}.amazonaws.com/${operatorUserPool.userPoolId}`,
      { jwtAudience: [operatorClient.userPoolClientId] },
    );

    httpApi.addRoutes({
      path: "/health",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: routeIntegration,
    });
    httpApi.addRoutes({
      path: "/v1/routes",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: routeIntegration,
    });
    httpApi.addRoutes({
      path: "/v1/events/active",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: disruptionIntegration,
    });
    httpApi.addRoutes({
      path: "/v1/events",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: disruptionIntegration,
      authorizer: operatorAuthorizer,
    });
    httpApi.addRoutes({
      path: "/v1/events/{eventId}/resolve",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: disruptionIntegration,
      authorizer: operatorAuthorizer,
    });

    const dashboard = new cloudwatch.Dashboard(this, "RoutingDashboard", {
      dashboardName: "ezpath-routing",
    });
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "Routing Lambda p50/p95 duration",
        left: [
          routeFunction.metricDuration({ statistic: "p50" }),
          routeFunction.metricDuration({ statistic: "p95" }),
        ],
      }),
      new cloudwatch.GraphWidget({
        title: "Routing Lambda errors and throttles",
        left: [routeFunction.metricErrors(), routeFunction.metricThrottles()],
      }),
      new cloudwatch.GraphWidget({
        title: "Disruption Lambda invocations and errors",
        left: [disruptionFunction.metricInvocations(), disruptionFunction.metricErrors()],
      }),
    );

    new CfnOutput(this, "ApiUrl", { value: httpApi.apiEndpoint });
    new CfnOutput(this, "GraphBucketName", { value: graphBucket.bucketName });
    new CfnOutput(this, "GraphObjectKey", { value: "graphs/campus.graphml" });
    new CfnOutput(this, "StatusTableName", { value: statusTable.tableName });
    new CfnOutput(this, "OperatorUserPoolId", { value: operatorUserPool.userPoolId });
    new CfnOutput(this, "OperatorUserPoolClientId", { value: operatorClient.userPoolClientId });
  }
}
