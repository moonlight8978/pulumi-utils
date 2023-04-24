import { getCallerIdentity, getRegion, iam } from '@pulumi/aws'
import { all, getStack } from '@pulumi/pulumi'
import { createName } from './naming'

export const ecsTaskExecutionPolicy = all([getCallerIdentity({}), getRegion()]).apply(
  ([currentIdentity, currentRegion]) =>
    new iam.Policy(createName('default-ecs-task-execution-policy'), {
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'ecr:GetAuthorizationToken',
              'ecr:BatchCheckLayerAvailability',
              'ecr:GetDownloadUrlForLayer',
              'ecr:BatchGetImage',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
            ],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: ['ssm:GetParameters', 'secretsmanager:GetSecretValue', 'kms:Decrypt'],
            Resource: [
              `arn:aws:ssm:${currentRegion.name}:${currentIdentity.accountId}:parameter/${getStack()}/*`,
              `arn:aws:secretsmanager:${currentRegion.name}:${currentIdentity.accountId}:secret:${getStack()}*`,
              `arn:aws:kms:${currentRegion.name}:${currentIdentity.accountId}:key/${getStack()}*`,
            ],
          },
        ],
      }),
    })
)

export const ecsTaskRolePolicy = iam.getPolicyDocument({
  statements: [
    {
      actions: ['sts:AssumeRole'],
      principals: [
        {
          type: 'Service',
          identifiers: ['ecs-tasks.amazonaws.com'],
        },
      ],
    },
  ],
})

export const ecsTaskExecutionRole = new iam.Role(createName('default-ecs-task-execution-role'), {
  managedPolicyArns: [ecsTaskExecutionPolicy.arn],
  assumeRolePolicy: ecsTaskRolePolicy.then((assumeRolePolicy) => assumeRolePolicy.json),
})
