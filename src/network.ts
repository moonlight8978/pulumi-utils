import * as aws from '@pulumi/aws'

export const getAvailabilityZoneName = (zone: string) => {
  return aws.getRegion().then((region) => `${region.name}${zone}`)
}
