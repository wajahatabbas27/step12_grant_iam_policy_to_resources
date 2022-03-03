# AWS IAM policies and secret manager

it is a very important topic to get started as it is necessary and every step of the repo to generate it.

Admin assign users to a particular group and there are few policies like , lambdafullaccess , dynamoDbfullaccess given ,
we can also add particularly the user to a group where we have given the access.

## Policies

we can also create the policies by ourself , where we can grant a particular role to a particular user
Policy is always there for a particular service , policy can only be granted to the Service.
And to our Requirement , We define a particular Policy , therefore it has access to the user lately , and we give them only permission of things as written inside the policy ; not more than that , ( if a user is assigned a policy can read and write , but they cannot delete )

Many polices are managed by -- AWS and they are predefined ,
but if we wanted to create a particular policy , we can also create the policy according to our requirement

After assignng a policy , we can grant it to a particular user or to a group

## ROLE

If a particular service wants to access a particular service , then we have roles
A role can have multiple policies and we can assign roles to multiple services.

Web Identity is a external service grant to a particular user , which is external service by AWS similar to SAML.

### We assign a user , group , role then we assign a policy to that particular thing.

We donot assign role to a particular user but a poilcy

We never knew ! How cloud watch is available with the lambda function , there is role defined to that particular service that is AWSLambdaBasicExecutionRole

## In CDK - defing roles and policies

First defining a Role , where we are assigning a lambda function as a role , then assigning the policy to that particular role
We will be writing the policy and there we are writing what we actually wanted like giving full acees inside the policy
or only giving access for a particular thing in the policy

role.addtoPolicy() -- its to assign the policy to a particular role

and we define the role inside our lambda function as well which we want to have and give that access to it
like here we give roles to the dynamodb to read and write of only one particular table : that is table.Arn

## Conclusion

Here I have generated the role and then the policy as well and then assigned that role to that particular policy ,
After assigning that policy used that role inside the lambda functiona as well and then also created the resolver and used appsync.mappingTemplate.toString in it as well here.
