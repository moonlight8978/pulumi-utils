import * as pulumi from '@pulumi/pulumi'

export const createName = (name: string, delimiter = '-') => [pulumi.getStack(), name].join(delimiter)

export const tagsForComponent = (name: string, tags: Record<string, string> = {}) => tagsForName(createName(name), tags)

export const tagsForName = (name: string, tags: Record<string, string> = {}) => {
  return {
    ...tags,
    Name: name,
  }
}

export const createTags = (name: string, tags: Record<string, string> = {}) => {
  return tagsForName(createName(name), tags)
}

export const createParameterName = (service: string, parameterName: string) =>
  `/${[pulumi.getStack(), service, parameterName].join('/')}`
