import { ErrorStateData, MultilineResult } from './telnet/interfaces';

export interface BuiltinFunctionData {
    name: string;
    description: string;
}

export interface MooClient {
    connect(): Promise<null | ErrorStateData>;
    disconnect(): Promise<null | ErrorStateData>;

    eval(command: string): Promise<MultilineResult | ErrorStateData>;

    getVerbCode(object: string, verb: string): Promise<string[] | ErrorStateData>;
    getBuiltinFunctionsDocumentation(): Promise<BuiltinFunctionData[] | ErrorStateData>;
}