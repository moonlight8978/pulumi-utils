import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

import { createName, createSafeName, createSafeTags, createTags } from './naming'
import { cacheDisabledPolicyId, cacheOptimizedPolicyId, securityHeaderResponsePolicyId } from './constants'

export const createStaticWebsite = (identity: string, domain: string, certificateArn: string) => {
  const bucket = new aws.s3.BucketV2(identity, {
    bucket: createName(identity, true),
  })

  new aws.s3.BucketPublicAccessBlock(identity, {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  })

  const cloudfrontOAI = new aws.cloudfront.OriginAccessIdentity(identity)

  const name = createName(identity, true)
  const deployerIdentity = `${identity}-deployer`

  new aws.cloudfront.Distribution(createName(identity, true), {
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
      cachePolicyId: cacheOptimizedPolicyId,
      responseHeadersPolicyId: securityHeaderResponsePolicyId,
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
        cachePolicyId: cacheDisabledPolicyId,
        responseHeadersPolicyId: securityHeaderResponsePolicyId,
      },
    ],
    priceClass: 'PriceClass_All',
    restrictions: {
      geoRestriction: {
        restrictionType: 'none',
      },
    },
    tags: createSafeTags(identity),
    viewerCertificate: {
      acmCertificateArn: certificateArn,
      sslSupportMethod: 'sni-only',
    },
    defaultRootObject: 'index.html',
    aliases: [domain],
  })

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
      ]
    }),
  })

  new aws.s3.BucketPolicy(identity, {
    bucket: bucket.id,
    policy: allowAccessFromCloudfrontPolicyDocument.apply((document) => document.json),
  })

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
      }).json
    }),
    tags: createTags(deployerIdentity),
  })

  const deployer = new aws.iam.User(deployerIdentity, {
    name: createName(deployerIdentity),
  })

  const deployerGroup = new aws.iam.Group(deployerIdentity, {
    name: createSafeName(deployerIdentity),
  })

  new aws.iam.GroupPolicyAttachment(deployerIdentity, {
    group: deployerGroup.id,
    policyArn: deployerPolicy.arn,
  })

  new aws.iam.GroupMembership(deployerIdentity, {
    group: deployerGroup.id,
    users: [deployer.id],
  })
}
