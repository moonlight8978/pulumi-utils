import { Output } from '@pulumi/pulumi';
export declare const securityHeaderResponsePolicyId = "67f7725c-6f97-4210-82d7-5512b31e9d03";
export declare const cacheDisabledPolicyId = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad";
export declare const cacheOptimizedPolicyId = "658327ea-f89d-4fab-a63d-7e88639e58f6";
export interface InternetAccessibleOptions {
    domain?: string | string[];
    certificateArn?: string;
    pathToCachePolicyId: Record<string, string>;
    defaultPolicyId: string;
}
export declare const createPublicS3Storage: (name: string, deployKeyEncryptionPublicKey: string | Output<string>, internetAccessibleOptions?: InternetAccessibleOptions, bucketNameSalt?: string) => {
    bucket: import("@pulumi/aws/s3/bucketV2").BucketV2;
    deployer: import("@pulumi/aws/iam/user").User;
    deployerAccessKey: import("@pulumi/aws/iam/accessKey").AccessKey;
    cdn: import("@pulumi/aws/cloudfront/distribution").Distribution | null;
};
