export interface MaybeComponentConfigData {
    enabled: boolean;
}
export declare function createMaybeComponent<T>(config: MaybeComponentConfigData, create: () => T): T | undefined;
