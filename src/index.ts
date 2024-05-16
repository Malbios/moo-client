import { TelnetClient, ConnectionState, ErrorStateData, VerbCodeStateData } from './telnet/interfaces';
import { VerbData } from './models';

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export default class MooClient {
    private telnetClient;

    private serverAddress: string;
    private serverPort: number;
    private serverUsername: string;
    private serverPassword: string;

    constructor(telnetClient: TelnetClient, serverAddress: string, serverPort: number, serverUsername: string, serverPassword: string) {
        this.telnetClient = telnetClient;

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

        this.telnetClient.connect(this.serverAddress, this.serverPort,
            this.serverUsername, this.serverPassword);

        let finished = false;

        while (!finished) {
            switch (this.telnetClient.getState()) {
                case ConnectionState.undefined: {
                    await delay(1);
                    break;
                }

                case ConnectionState.connected: {
                    this.telnetClient.changeState(ConnectionState.undefined);
                    this.telnetClient.send(`@edit ${object}:${verb}`);
                    break;
                }

                case ConnectionState.error: {
                    this.telnetClient.send('@quit');

                    const errorStateData = this.telnetClient.getStateData() as ErrorStateData;
                    throw Error(errorStateData?.message ?? 'unexpected error with no message');
                }

                case ConnectionState.multilineResult: {
                    this.telnetClient.send('@quit');

                    const stateData = this.telnetClient.getStateData() as VerbCodeStateData;
                    if (!stateData) {
                        throw Error('unexpected error with no verb data');
                    }

                    verbData = new VerbData(stateData.reference, stateData.name, stateData.lines);
                    finished = true;

                    break;
                }
            }
        }

        if (!verbData) {
            return new VerbData('', '', []);
        }

        return verbData;
    }
}