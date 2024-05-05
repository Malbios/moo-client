import { TelnetClient } from './telnet/telnet-client';
import { ConnectionState } from './telnet/interfaces';
import { VerbData } from './verb-data';

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
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
                    await delay(100);
                    throw Error(this.telnetClient.getStateData().message);
                }

                case ConnectionState.multilineResult: {
                    this.telnetClient.send('@quit');
                    const stateData = this.telnetClient.getStateData();
                    verbData = new VerbData(stateData.reference,
                        stateData.name, stateData.lines);
                    finished = true;
                    await delay(100);
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