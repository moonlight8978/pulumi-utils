export declare const createName: (name: string, delimiter?: string) => string;
export declare const tagsForComponent: (name: string, tags?: Record<string, string>) => {
    Name: string;
};
export declare const tagsForName: (name: string, tags?: Record<string, string>) => {
    Name: string;
};
export declare const createTags: (name: string, tags?: Record<string, string>) => {
    Name: string;
};
export declare const createParameterName: (service: string, parameterName: string) => string;
