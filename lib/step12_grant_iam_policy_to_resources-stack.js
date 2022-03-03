"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Step12GrantIamPolicyToResourcesStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// import * as sqs from 'aws-cdk-lib/aws-sqs';
const lambda = require("aws-cdk-lib/aws-lambda");
const ddb = require("aws-cdk-lib/aws-dynamodb");
const appsync = require("@aws-cdk/aws-appsync-alpha");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class Step12GrantIamPolicyToResourcesStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const api = new appsync.GraphqlApi(this, "RoleApiExample", {
            name: "ApiForRole",
            schema: appsync.Schema.fromAsset('graphql/schema.gql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: aws_cdk_lib_1.Expiration.after(aws_cdk_lib_1.Duration.days(365))
                    }
                }
            },
            xrayEnabled: true
        });
        new aws_cdk_lib_1.CfnOutput(this, "APiUrl", {
            value: api.graphqlUrl
        });
        new aws_cdk_lib_1.CfnOutput(this, "graphqlapi", {
            value: api.apiKey || ''
        });
        //dynamo table
        const dynamoTable = new ddb.Table(this, "Table", {
            partitionKey: {
                name: "id",
                type: ddb.AttributeType.STRING
            }
        });
        //creating specific role for the lambda function
        const role = new aws_iam_1.Role(this, "LambdaRole", {
            assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com')
        });
        //Attaching DynamoDb access to Policy
        const policy = new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
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
            timeout: aws_cdk_lib_1.Duration.seconds(10),
            role: role,
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
exports.Step12GrantIamPolicyToResourcesStack = Step12GrantIamPolicyToResourcesStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcDEyX2dyYW50X2lhbV9wb2xpY3lfdG9fcmVzb3VyY2VzLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RlcDEyX2dyYW50X2lhbV9wb2xpY3lfdG9fcmVzb3VyY2VzLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFpRjtBQUVqRiw4Q0FBOEM7QUFDOUMsaURBQWlEO0FBQ2pELGdEQUFnRDtBQUVoRCxzREFBc0Q7QUFFdEQsaURBQXNGO0FBT3RGLE1BQWEsb0NBQXFDLFNBQVEsbUJBQUs7SUFDN0QsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFrQjtRQUMxRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3pELElBQUksRUFBRSxZQUFZO1lBQ2xCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztZQUN0RCxtQkFBbUIsRUFBRTtnQkFDbkIsb0JBQW9CLEVBQUU7b0JBQ3BCLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPO29CQUNwRCxZQUFZLEVBQUU7d0JBQ1osT0FBTyxFQUFFLHdCQUFVLENBQUMsS0FBSyxDQUFDLHNCQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUM5QztpQkFDRjthQUNGO1lBQ0QsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDNUIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVO1NBQ3RCLENBQUMsQ0FBQTtRQUVGLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUU7U0FDeEIsQ0FBQyxDQUFBO1FBRUYsY0FBYztRQUNkLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQy9DLFlBQVksRUFBRTtnQkFDWixJQUFJLEVBQUUsSUFBSTtnQkFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNO2FBQy9CO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsZ0RBQWdEO1FBQ2hELE1BQU0sSUFBSSxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDeEMsU0FBUyxFQUFFLElBQUksMEJBQWdCLENBQUMsc0JBQXNCLENBQUM7U0FDeEQsQ0FBQyxDQUFDO1FBRUgscUNBQXFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUkseUJBQWUsQ0FBQztZQUNqQyxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7WUFDakMsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCLENBQUMsQ0FBQztRQUVILDZCQUE2QjtRQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXpCLHNDQUFzQztRQUN0QyxNQUFNLGVBQWUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ2xFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixPQUFPLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxJQUFJO1lBQ1YsV0FBVyxFQUFFO2dCQUNYLE9BQU8sRUFBRSxXQUFXLENBQUMsU0FBUzthQUMvQjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXhGLGtCQUFrQixDQUFDLGNBQWMsQ0FBQztZQUNoQyxRQUFRLEVBQUUsVUFBVTtZQUNwQixTQUFTLEVBQUUsWUFBWTtZQUN2QixzQkFBc0IsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQzs7Ozs7Ozs7O09BUzFELENBQUM7U0FDSCxDQUFDLENBQUM7SUFFTCxDQUFDO0NBQ0Y7QUEvRUQsb0ZBK0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2ZuT3V0cHV0LCBEdXJhdGlvbiwgRXhwaXJhdGlvbiwgU3RhY2ssIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbi8vIGltcG9ydCAqIGFzIHNxcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3FzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGRkYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgYXBwc3luYyBmcm9tICdAYXdzLWNkay9hd3MtYXBwc3luYy1hbHBoYSc7XG5pbXBvcnQgeyB0cmFjZSB9IGZyb20gJ2NvbnNvbGUnO1xuaW1wb3J0IHsgRWZmZWN0LCBQb2xpY3lTdGF0ZW1lbnQsIFJvbGUsIFNlcnZpY2VQcmluY2lwYWwgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFNlcnZpY2UgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VydmljZWRpc2NvdmVyeSc7XG5pbXBvcnQgeyBMYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VzLWFjdGlvbnMnO1xuaW1wb3J0IHsgQ2ZuRGlzayB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1saWdodHNhaWwnO1xuXG5cblxuZXhwb3J0IGNsYXNzIFN0ZXAxMkdyYW50SWFtUG9saWN5VG9SZXNvdXJjZXNTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBhcGkgPSBuZXcgYXBwc3luYy5HcmFwaHFsQXBpKHRoaXMsIFwiUm9sZUFwaUV4YW1wbGVcIiwge1xuICAgICAgbmFtZTogXCJBcGlGb3JSb2xlXCIsXG4gICAgICBzY2hlbWE6IGFwcHN5bmMuU2NoZW1hLmZyb21Bc3NldCgnZ3JhcGhxbC9zY2hlbWEuZ3FsJyksXG4gICAgICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgICAgIGRlZmF1bHRBdXRob3JpemF0aW9uOiB7XG4gICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IGFwcHN5bmMuQXV0aG9yaXphdGlvblR5cGUuQVBJX0tFWSxcbiAgICAgICAgICBhcGlLZXlDb25maWc6IHtcbiAgICAgICAgICAgIGV4cGlyZXM6IEV4cGlyYXRpb24uYWZ0ZXIoRHVyYXRpb24uZGF5cygzNjUpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHhyYXlFbmFibGVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsIFwiQVBpVXJsXCIsIHtcbiAgICAgIHZhbHVlOiBhcGkuZ3JhcGhxbFVybFxuICAgIH0pXG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsIFwiZ3JhcGhxbGFwaVwiLCB7XG4gICAgICB2YWx1ZTogYXBpLmFwaUtleSB8fCAnJ1xuICAgIH0pXG5cbiAgICAvL2R5bmFtbyB0YWJsZVxuICAgIGNvbnN0IGR5bmFtb1RhYmxlID0gbmV3IGRkYi5UYWJsZSh0aGlzLCBcIlRhYmxlXCIsIHtcbiAgICAgIHBhcnRpdGlvbktleToge1xuICAgICAgICBuYW1lOiBcImlkXCIsXG4gICAgICAgIHR5cGU6IGRkYi5BdHRyaWJ1dGVUeXBlLlNUUklOR1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9jcmVhdGluZyBzcGVjaWZpYyByb2xlIGZvciB0aGUgbGFtYmRhIGZ1bmN0aW9uXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBSb2xlKHRoaXMsIFwiTGFtYmRhUm9sZVwiLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpXG4gICAgfSk7XG5cbiAgICAvL0F0dGFjaGluZyBEeW5hbW9EYiBhY2Nlc3MgdG8gUG9saWN5XG4gICAgY29uc3QgcG9saWN5ID0gbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFsnZHluYW1vZGI6KicsIFwibG9nczoqXCJdLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXVxuICAgIH0pO1xuXG4gICAgLy9HcmFudGluZyBJQU0gcG9saWN5IHRvIFJvbGVcbiAgICByb2xlLmFkZFRvUG9saWN5KHBvbGljeSk7XG5cbiAgICAvL0xhbWJkYSBGdW5jdGlvbiBkZWZpbmluZyByb2xlcyBoZXJlIFxuICAgIGNvbnN0IExhbWJkYV9GdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJMYW1iZGFGdWNudGlvblwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTJfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhJyksXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMTApLFxuICAgICAgcm9sZTogcm9sZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL0RlZmluaW5nIHJvbGUgdG8gTGFtYmRhXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBcIlRBQkxFXCI6IGR5bmFtb1RhYmxlLnRhYmxlTmFtZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgbGFtYmRhX2RhdGFfc291cmNlID0gYXBpLmFkZExhbWJkYURhdGFTb3VyY2UoXCJMYW1iZGFEYXRhU291cmNlXCIsIExhbWJkYV9GdW5jdGlvbik7XG5cbiAgICBsYW1iZGFfZGF0YV9zb3VyY2UuY3JlYXRlUmVzb2x2ZXIoe1xuICAgICAgdHlwZU5hbWU6IFwiTXV0YXRpb25cIixcbiAgICAgIGZpZWxkTmFtZTogXCJjcmVhdGVEYXRhXCIsXG4gICAgICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiBhcHBzeW5jLk1hcHBpbmdUZW1wbGF0ZS5mcm9tU3RyaW5nKGBcbiAgICAgICAgICAkdXRpbC5xcigkY29udGV4dC5hcmd1bWVudHMucHV0KFwiaWRcIiwkdXRpbC5kZWZhdWx0SWZOdWxsKCRjdHguYXJndW1lbnRzLmlkLCR1dGlsLmF1dG9JZCgpKSkpXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMjAxNy0wMi0yOFwiLFxuICAgICAgICAgICAgXCJvcGVyYXRpb25cIjogXCJJbnZva2VcIixcbiAgICAgICAgICAgIFwicGF5bG9hZFwiOntcbiAgICAgICAgICAgICAgXCJhcmd1bWVudHNcIjogJHV0aWwudG9Kc29uKCRjb250ZXh0LmFyZ3VtZW50cylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICBgKVxuICAgIH0pO1xuXG4gIH1cbn1cbiJdfQ==