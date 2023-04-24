import { Config } from '@pulumi/pulumi'

export interface ProjectToCertificateArnConfig extends Record<string, string> {}

export const createGetCertificateArn = (config: Config) => {
  const projectToCertificateArnConfig = config.requireObject<ProjectToCertificateArnConfig>('projectToCertificateArn')

  return (project: string) => projectToCertificateArnConfig[project]!
}
