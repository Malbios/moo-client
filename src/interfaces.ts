import { VerbData } from './models';

export interface MooClient {
    getVerbData(object: string, verb: string): Promise<VerbData>;
}