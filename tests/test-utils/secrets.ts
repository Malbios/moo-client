import { readFileSync } from 'fs';
import { parse } from 'yaml';

class ServerCredentials {
    public serverAddress = '';
    public serverPort = 0;
    public serverUsername = '';
    public serverPassword = '';
}

export function getServerCredentials(): ServerCredentials {
    const fileContent = readFileSync('./secret.yml').toString('utf8');
    return parse(fileContent).ServerCredentials as ServerCredentials;
}