import { TelnetClient } from "./telnet/telnet-client";

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export class VerbData {
    public reference: string;
    public name: string;
    public code: string[];

    constructor(reference: string, name: string, code: string[]) {
        this.reference = reference;
        this.name = name;
        this.code = code;
    }
}

export class MooClient {
    private telnetClient = new TelnetClient();

    private serverAddress: string;
    private serverPort: number;
    private serverUsername: string;
    private serverPassword: string;

    constructor(serverAddress: string, serverPort: number, serverUsername: string, serverPassword: string) {
        this.serverAddress = serverAddress;
        this.serverPort = serverPort;
        this.serverUsername = serverUsername;
        this.serverPassword = serverPassword;
    }

    public enableDebugging() {
        this.telnetClient.enableDebugLogging();
    }

    public async getVerbData(object: string, verb: string): Promise<VerbData> {
        let verbData: VerbData | null = null;

        this.telnetClient.onConnected = () => {
            this.telnetClient.send(`@edit ${object}:${verb}`);
        };

        this.telnetClient.onMultilineResult = result => {
            verbData = new VerbData(result.reference, result.name, result.lines);
            this.telnetClient.send('@quit');
        };

        this.telnetClient.connect(this.serverAddress, this.serverPort,
            this.serverUsername, this.serverPassword);

        while (!verbData) {
            await delay(1);
        }

        return verbData;
    }
}