import { Config } from '@pulumi/pulumi';
export interface ProjectToCertificateArnConfig extends Record<string, string> {
}
export declare const createGetCertificateArn: (config: Config) => (project: string) => string;
