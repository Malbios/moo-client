export interface VerbData {
    reference: string;
    name: string;
    code: string[];
}

export interface BuiltinFunctionData {
    name: string;
    description: string;
}

export interface MooClient {
    getVerbData(object: string, verb: string): Promise<VerbData | Error>;
}