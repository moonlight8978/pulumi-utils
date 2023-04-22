"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublicS3Storage = exports.cacheOptimizedPolicyId = exports.cacheDisabledPolicyId = exports.securityHeaderResponsePolicyId = void 0;
const aws_1 = require("@pulumi/aws");
const pulumi_1 = require("@pulumi/pulumi");
const naming_1 = require("./naming");
exports.securityHeaderResponsePolicyId = '67f7725c-6f97-4210-82d7-5512b31e9d03';
exports.cacheDisabledPolicyId = '4135ea2d-6df8-44a3-9df3-4b5a84be39ad';
exports.cacheOptimizedPolicyId = '658327ea-f89d-4fab-a63d-7e88639e58f6';
const createPublicS3Storage = (name, deployKeyEncryptionPublicKey, internetAccessibleOptions, bucketNameSalt) => {
    const bucket = new aws_1.s3.BucketV2(`${name}-bucket`, {
        bucket: bucketNameSalt ? (0, naming_1.createName)(`${name}-${bucketNameSalt}`) : (0, naming_1.createName)(name),
        tags: (0, naming_1.tagsForComponent)(name),
    });
    new aws_1.s3.BucketPublicAccessBlock(`${name}-bucket-public-access-block`, {
        bucket: bucket.id,
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
    });
    const deployerIamPolicy = new aws_1.iam.Policy(`${name}-deployer-policy`, {
        name: (0, naming_1.createName)(`${name}-deployer`),
        policy: bucket.arn.apply((arn) => {
            return aws_1.iam.getPolicyDocumentOutput({
                statements: [
                    {
                        sid: 'ListObjectsInBucket',
                        effect: 'Allow',
                        actions: ['s3:ListBucket'],
                        resources: [arn],
                    },
                    {
                        sid: 'AllObjectActions',
                        effect: 'Allow',
                        actions: ['s3:*Object'],
                        resources: [`${arn}/*`],
                    },
                ],
            }).json;
        }),
        tags: (0, naming_1.tagsForComponent)(name),
    });
    const deployer = new aws_1.iam.User(`${name}-deployer`, {
        name: (0, naming_1.createName)(`${name}-deployer`),
        tags: (0, naming_1.tagsForComponent)(name),
    });
    const deployerGroup = new aws_1.iam.Group(`${name}-deployer-group`, {
        name: (0, naming_1.createName)(`${name}-deployer`),
    });
    const deployerAccessKey = new aws_1.iam.AccessKey(`${name}-deployer-access-key`, {
        user: deployer.name,
        pgpKey: deployKeyEncryptionPublicKey,
        status: 'Active',
    });
    new aws_1.iam.GroupPolicyAttachment(`${name}-deployer-policy-attachment`, {
        group: deployerGroup.id,
        policyArn: deployerIamPolicy.arn,
    });
    new aws_1.iam.GroupMembership(`${name}-deployer-group-membership`, {
        group: deployerGroup.id,
        users: [deployer.id],
        name: (0, naming_1.createName)(name),
    });
    let cdn = null;
    if (internetAccessibleOptions) {
        const cloudfrontOAI = new aws_1.cloudfront.OriginAccessIdentity(name);
        cdn = new aws_1.cloudfront.Distribution(`${name}-cloudfront-distribution`, {
            comment: (0, naming_1.createName)(name),
            origins: [
                {
                    domainName: bucket.bucketRegionalDomainName,
                    s3OriginConfig: {
                        originAccessIdentity: cloudfrontOAI.cloudfrontAccessIdentityPath,
                    },
                    originId: name,
                },
            ],
            enabled: true,
            isIpv6Enabled: true,
            defaultCacheBehavior: {
                allowedMethods: ['GET', 'HEAD'],
                cachedMethods: ['GET', 'HEAD'],
                targetOriginId: name,
                viewerProtocolPolicy: 'redirect-to-https',
                compress: true,
                cachePolicyId: internetAccessibleOptions.defaultPolicyId,
                responseHeadersPolicyId: exports.securityHeaderResponsePolicyId,
            },
            orderedCacheBehaviors: Object.entries(internetAccessibleOptions.pathToCachePolicyId).map(([pathPattern, cachePolicyId]) => ({
                pathPattern,
                allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
                cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
                targetOriginId: name,
                compress: true,
                viewerProtocolPolicy: 'redirect-to-https',
                cachePolicyId,
                responseHeadersPolicyId: exports.securityHeaderResponsePolicyId,
            })),
            priceClass: 'PriceClass_All',
            restrictions: {
                geoRestriction: {
                    restrictionType: 'none',
                },
            },
            tags: (0, naming_1.tagsForComponent)(name),
            viewerCertificate: {
                acmCertificateArn: internetAccessibleOptions.certificateArn,
                cloudfrontDefaultCertificate: !internetAccessibleOptions.certificateArn,
                sslSupportMethod: 'sni-only',
            },
            defaultRootObject: 'index.html',
            aliases: [internetAccessibleOptions.domain].flat().filter(Boolean),
        });
        const allowAccessFromCloudfrontPolicyDocument = aws_1.iam.getPolicyDocumentOutput({
            statements: (0, pulumi_1.all)([cloudfrontOAI.iamArn, bucket.arn]).apply((arns) => {
                return [
                    {
                        sid: '1',
                        effect: 'Allow',
                        principals: [
                            {
                                type: 'AWS',
                                identifiers: [arns[0]],
                            },
                        ],
                        actions: ['s3:GetObject'],
                        resources: [`${arns[1]}/*`],
                    },
                ];
            }),
        });
        new aws_1.s3.BucketPolicy(`${name}-bucket-policy`, {
            bucket: bucket.id,
            policy: allowAccessFromCloudfrontPolicyDocument.apply((document) => document.json),
        });
    }
    return {
        bucket,
        deployer,
        deployerAccessKey,
        cdn,
    };
};
exports.createPublicS3Storage = createPublicS3Storage;
//# sourceMappingURL=storage.js.map