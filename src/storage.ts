import { cloudfront, iam, s3 } from '@pulumi/aws'
import { all, Output } from '@pulumi/pulumi'
import { createName, tagsForComponent } from './naming'

export const securityHeaderResponsePolicyId = '67f7725c-6f97-4210-82d7-5512b31e9d03'
export const cacheDisabledPolicyId = '4135ea2d-6df8-44a3-9df3-4b5a84be39ad'
export const cacheOptimizedPolicyId = '658327ea-f89d-4fab-a63d-7e88639e58f6'

export interface InternetAccessibleOptions {
  domain?: string | string[]
  certificateArn?: string
  pathToCachePolicyId: Record<string, string>
  defaultPolicyId: string
}

export const createPublicS3Storage = (
  name: string,
  deployKeyEncryptionPublicKey: string | Output<string>,
  internetAccessibleOptions?: InternetAccessibleOptions,
  bucketNameSalt?: string
) => {
  const bucket = new s3.BucketV2(`${name}-bucket`, {
    bucket: bucketNameSalt ? createName(`${name}-${bucketNameSalt}`) : createName(name),
    tags: tagsForComponent(name),
  })

  new s3.BucketPublicAccessBlock(`${name}-bucket-public-access-block`, {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  })

  const deployerIamPolicy = new iam.Policy(`${name}-deployer-policy`, {
    name: createName(`${name}-deployer`),
    policy: bucket.arn.apply((arn) => {
      return iam.getPolicyDocumentOutput({
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
    tags: tagsForComponent(name),
  })

  const deployer = new iam.User(`${name}-deployer`, {
    name: createName(`${name}-deployer`),
    tags: tagsForComponent(name),
  })

  const deployerGroup = new iam.Group(`${name}-deployer-group`, {
    name: createName(`${name}-deployer`),
  })

  const deployerAccessKey = new iam.AccessKey(`${name}-deployer-access-key`, {
    user: deployer.name,
    pgpKey: deployKeyEncryptionPublicKey,
    status: 'Active',
  })

  new iam.GroupPolicyAttachment(`${name}-deployer-policy-attachment`, {
    group: deployerGroup.id,
    policyArn: deployerIamPolicy.arn,
  })

  new iam.GroupMembership(`${name}-deployer-group-membership`, {
    group: deployerGroup.id,
    users: [deployer.id],
    name: createName(name),
  })

  let cdn = null

  if (internetAccessibleOptions) {
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(name)

    cdn = new cloudfront.Distribution(`${name}-cloudfront-distribution`, {
      comment: createName(name),
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
        responseHeadersPolicyId: securityHeaderResponsePolicyId,
      },
      orderedCacheBehaviors: Object.entries(internetAccessibleOptions.pathToCachePolicyId).map(
        ([pathPattern, cachePolicyId]) => ({
          pathPattern,
          allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
          targetOriginId: name,
          compress: true,
          viewerProtocolPolicy: 'redirect-to-https',
          cachePolicyId,
          responseHeadersPolicyId: securityHeaderResponsePolicyId,
        })
      ),
      priceClass: 'PriceClass_All',
      restrictions: {
        geoRestriction: {
          restrictionType: 'none',
        },
      },
      tags: tagsForComponent(name),
      viewerCertificate: {
        acmCertificateArn: internetAccessibleOptions.certificateArn,
        cloudfrontDefaultCertificate: !internetAccessibleOptions.certificateArn,
        sslSupportMethod: 'sni-only',
      },
      defaultRootObject: 'index.html',
      aliases: [internetAccessibleOptions.domain].flat().filter(Boolean) as string[],
    })

    const allowAccessFromCloudfrontPolicyDocument = iam.getPolicyDocumentOutput({
      statements: all([cloudfrontOAI.iamArn, bucket.arn]).apply((arns) => {
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

    new s3.BucketPolicy(`${name}-bucket-policy`, {
      bucket: bucket.id,
      policy: allowAccessFromCloudfrontPolicyDocument.apply((document) => document.json),
    })
  }

  return {
    bucket,
    deployer,
    deployerAccessKey,
    cdn,
  }
}
