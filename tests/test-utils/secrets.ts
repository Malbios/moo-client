import { readFileSync } from 'fs';
import { parse } from 'yaml';

interface ServerCredentials {
    address: string;
    port: number;
    username: string;
    password: string;
}

export function getServerCredentials(): ServerCredentials {
    const fileContent = readFileSync('./secret.yml').toString('utf8');
    return parse(fileContent).Credentials.TestServer as ServerCredentials;
}

export function getMinimalCredentials(): ServerCredentials {
    const fileContent = readFileSync('./secret.yml').toString('utf8');
    return parse(fileContent).Credentials.MinimalServer as ServerCredentials;
}