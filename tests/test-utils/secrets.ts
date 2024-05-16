import { readFileSync } from 'fs';
import { parse } from 'yaml';

class ServerCredentials {
    public serverAddress: string = '';
    public serverPort: number = 0;
    public serverUsername: string = '';
    public serverPassword: string = '';
}

export function getServerCredentials(): ServerCredentials {
    const fileContent = readFileSync('./secret.yml').toString('utf8');
    return parse(fileContent).ServerCredentials as ServerCredentials;
}