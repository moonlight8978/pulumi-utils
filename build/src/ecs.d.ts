import { iam } from '@pulumi/aws';
export declare const ecsTaskExecutionPolicy: import("@pulumi/pulumi").Output<import("@pulumi/aws/iam/policy").Policy>;
export declare const ecsTaskRolePolicy: Promise<iam.GetPolicyDocumentResult>;
export declare const ecsTaskExecutionRole: import("@pulumi/aws/iam/role").Role;
