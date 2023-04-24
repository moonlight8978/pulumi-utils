import { Config } from '@pulumi/pulumi';
export interface SecretNameToValueConfig extends Record<string, string> {
}
export declare const createParameterNameFromRef: (ref: string) => string;
export interface ServiceSecret {
    name?: string;
    ref: string;
}
export declare const createSecrets: (config: Config, project: string) => {
    secrets: import("@pulumi/aws/ssm/parameter").Parameter[];
    getSecretValue: (name: string) => string;
    findOrCreateServiceSecrets: (serviceSecrets: ServiceSecret[]) => import("@pulumi/pulumi").Output<import("@pulumi/aws/ssm/parameter").Parameter[]>;
};
