export interface MaybeComponentConfigData {
  enabled: boolean
}

export function createMaybeComponent<T>(config: MaybeComponentConfigData, create: () => T) {
  return config.enabled ? create() : undefined
}
