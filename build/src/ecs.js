"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ecsTaskExecutionRole = exports.ecsTaskRolePolicy = exports.ecsTaskExecutionPolicy = void 0;
const aws_1 = require("@pulumi/aws");
const pulumi_1 = require("@pulumi/pulumi");
const naming_1 = require("./naming");
exports.ecsTaskExecutionPolicy = (0, pulumi_1.all)([(0, aws_1.getCallerIdentity)({}), (0, aws_1.getRegion)()]).apply(([currentIdentity, currentRegion]) => new aws_1.iam.Policy((0, naming_1.createName)('default-ecs-task-execution-policy'), {
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
                    `arn:aws:ssm:${currentRegion.name}:${currentIdentity.accountId}:parameter/${(0, pulumi_1.getStack)()}/*`,
                    `arn:aws:secretsmanager:${currentRegion.name}:${currentIdentity.accountId}:secret:${(0, pulumi_1.getStack)()}*`,
                    `arn:aws:kms:${currentRegion.name}:${currentIdentity.accountId}:key/${(0, pulumi_1.getStack)()}*`,
                ],
            },
        ],
    }),
}));
exports.ecsTaskRolePolicy = aws_1.iam.getPolicyDocument({
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
});
exports.ecsTaskExecutionRole = new aws_1.iam.Role((0, naming_1.createName)('default-ecs-task-execution-role'), {
    managedPolicyArns: [exports.ecsTaskExecutionPolicy.arn],
    assumeRolePolicy: exports.ecsTaskRolePolicy.then((assumeRolePolicy) => assumeRolePolicy.json),
});
//# sourceMappingURL=ecs.js.map