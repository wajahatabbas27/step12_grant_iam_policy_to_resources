import { CfnOutput, Duration, Expiration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { trace } from 'console';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Service } from 'aws-cdk-lib/aws-servicediscovery';
import { Lambda } from 'aws-cdk-lib/aws-ses-actions';
import { CfnDisk } from 'aws-cdk-lib/aws-lightsail';



export class Step12GrantIamPolicyToResourcesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "RoleApiExample", {
      name: "ApiForRole",
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365))
          }
        }
      },
      xrayEnabled: true
    });

    new CfnOutput(this, "APiUrl", {
      value: api.graphqlUrl
    })

    new CfnOutput(this, "graphqlapi", {
      value: api.apiKey || ''
    })

    //dynamo table
    const dynamoTable = new ddb.Table(this, "Table", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING
      }
    });

    //creating specific role for the lambda function
    const role = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    });

    //Attaching DynamoDb access to Policy
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:*', "logs:*"],
      resources: ['*']
    });

    //Granting IAM policy to Role
    role.addToPolicy(policy);

    //Lambda Function defining roles here 
    const Lambda_Function = new lambda.Function(this, "LambdaFucntion", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: "index.handler",
      timeout: Duration.seconds(10),
      role: role,                                                        ///Defining role to Lambda
      environment: {
        "TABLE": dynamoTable.tableName
      }
    });

    const lambda_data_source = api.addLambdaDataSource("LambdaDataSource", Lambda_Function);

    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createData",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
          $util.qr($context.arguments.put("id",$util.defaultIfNull($ctx.arguments.id,$util.autoId())))
          {
            "version": "2017-02-28",
            "operation": "Invoke",
            "payload":{
              "arguments": $util.toJson($context.arguments)
            }
          }
      `)
    });

  }
}
