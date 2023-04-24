import { ssm } from '@pulumi/aws'
import { Config, all, getStack } from '@pulumi/pulumi'
import { createName } from './naming'

export interface SecretNameToValueConfig extends Record<string, string> {}

export const createParameterNameFromRef = (ref: string) => `/${getStack()}/${ref}`

export interface ServiceSecret {
  name?: string
  ref: string
}

export const createSecrets = (config: Config, project: string) => {
  const secretNameToValueConfig = config.requireObject<SecretNameToValueConfig>('secretNameToValue')

  const secrets = Object.entries(secretNameToValueConfig).map(([secretName, secretValue]) => {
    return new ssm.Parameter(createName(`${project}-${secretName.replace('/', '-')}-parameter`), {
      name: createParameterNameFromRef(`${project}/${secretName}`),
      value: secretValue,
      type: 'String',
    })
  })

  const getSecretValue = (name: string) => secretNameToValueConfig[name]

  return {
    secrets,
    getSecretValue,
    findOrCreateServiceSecrets: (serviceSecrets: ServiceSecret[]) => {
      return all(secrets.map((secret) => secret.name)).apply((secretNames) => {
        return serviceSecrets.map((serviceSecret) => {
          if (serviceSecret.name) {
            return new ssm.Parameter(createName(`${project}-${serviceSecret.name.replace('/', '-')}-parameter`), {
              name: createParameterNameFromRef(`${project}/${serviceSecret.name}`),
              value: getSecretValue(serviceSecret.ref),
              type: 'String',
            })
          }

          return secrets[
            secretNames.findIndex(
              (secretName) => secretName === createParameterNameFromRef(`${project}/${serviceSecret.ref}`)
            )
          ]
        })
      })
    },
  }
}
