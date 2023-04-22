"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaticWebsite = void 0;
const pulumi = __importStar(require("@pulumi/pulumi"));
const aws = __importStar(require("@pulumi/aws"));
const naming_1 = require("./naming");
const constants_1 = require("./constants");
const createStaticWebsite = (identity, domain, certificateArn) => {
    const bucket = new aws.s3.BucketV2(identity, {
        bucket: (0, naming_1.createName)(identity, true),
    });
    new aws.s3.BucketPublicAccessBlock(identity, {
        bucket: bucket.id,
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
    });
    const cloudfrontOAI = new aws.cloudfront.OriginAccessIdentity(identity);
    const name = (0, naming_1.createName)(identity, true);
    const deployerIdentity = `${identity}-deployer`;
    new aws.cloudfront.Distribution((0, naming_1.createName)(identity, true), {
        comment: identity,
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
            minTtl: 0,
            defaultTtl: 3600,
            maxTtl: 86400,
            cachePolicyId: constants_1.cacheOptimizedPolicyId,
            responseHeadersPolicyId: constants_1.securityHeaderResponsePolicyId,
        },
        orderedCacheBehaviors: [
            {
                pathPattern: '/index.html',
                allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
                cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
                targetOriginId: name,
                minTtl: 0,
                defaultTtl: 86400,
                maxTtl: 31536000,
                compress: true,
                viewerProtocolPolicy: 'redirect-to-https',
                cachePolicyId: constants_1.cacheDisabledPolicyId,
                responseHeadersPolicyId: constants_1.securityHeaderResponsePolicyId,
            },
        ],
        priceClass: 'PriceClass_All',
        restrictions: {
            geoRestriction: {
                restrictionType: 'none',
            },
        },
        tags: (0, naming_1.createSafeTags)(identity),
        viewerCertificate: {
            acmCertificateArn: certificateArn,
            sslSupportMethod: 'sni-only',
        },
        defaultRootObject: 'index.html',
        aliases: [domain],
    });
    const allowAccessFromCloudfrontPolicyDocument = aws.iam.getPolicyDocumentOutput({
        statements: pulumi.all([cloudfrontOAI.iamArn, bucket.arn]).apply((arns) => {
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
    new aws.s3.BucketPolicy(identity, {
        bucket: bucket.id,
        policy: allowAccessFromCloudfrontPolicyDocument.apply((document) => document.json),
    });
    const deployerPolicy = new aws.iam.Policy(`${deployerIdentity}-policy`, {
        policy: bucket.arn.apply((arn) => {
            return aws.iam.getPolicyDocumentOutput({
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
        tags: (0, naming_1.createTags)(deployerIdentity),
    });
    const deployer = new aws.iam.User(deployerIdentity, {
        name: (0, naming_1.createName)(deployerIdentity),
    });
    const deployerGroup = new aws.iam.Group(deployerIdentity, {
        name: (0, naming_1.createSafeName)(deployerIdentity),
    });
    new aws.iam.GroupPolicyAttachment(deployerIdentity, {
        group: deployerGroup.id,
        policyArn: deployerPolicy.arn,
    });
    new aws.iam.GroupMembership(deployerIdentity, {
        group: deployerGroup.id,
        users: [deployer.id],
    });
};
exports.createStaticWebsite = createStaticWebsite;
//# sourceMappingURL=website.js.map