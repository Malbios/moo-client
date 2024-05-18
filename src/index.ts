import {
    TelnetClient as ITelnetClient,
    ConnectionState,
    ErrorStateData,
    VerbCodeStateData
} from './telnet/interfaces';
import { TelnetClient } from './telnet/telnet-client';

import { MooClient as IMooClient } from './interfaces';
import { VerbData } from './models';

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export class MooClient implements IMooClient {
    private telnetClient;

    private serverAddress: string;
    private serverPort: number;
    private user: string;
    private password: string;

    private constructor(telnetClient: ITelnetClient, serverAddress: string, serverPort: number,
        user: string, password: string) {
        this.telnetClient = telnetClient;

        this.serverAddress = serverAddress;
        this.serverPort = serverPort;
        this.user = user;
        this.password = password;
    }

    public static create(serverAddress: string, serverPort: number, user: string, password: string,
        telnetClient?: ITelnetClient): MooClient {
        if (!telnetClient) {
            return new MooClient(TelnetClient.create(), serverAddress, serverPort, user, password);
        }

        return new MooClient(telnetClient, serverAddress, serverPort, user, password);
    }

    public enableDebugging() {
        this.telnetClient.enableDebugLogging();
    }

    public async getVerbData(object: string, verb: string): Promise<VerbData> {
        let verbData: VerbData | null = null;

        this.telnetClient.connect(this.serverAddress, this.serverPort, this.user, this.password);

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
            throw Error('unexpected state, did not find verb data');
        }

        return verbData;
    }
}