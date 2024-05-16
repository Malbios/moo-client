import { Socket } from 'net';
import { TelnetSocket } from 'telnet-stream';

import {
    TelnetClient as ITelnetClient,
    TelnetSocket as ITelnetSocket,
    TelnetMessageSender,
    ConnectionStateChanger,
    ConnectionState,
    ErrorStateData,
    VerbCodeStateData
} from './interfaces';

import { getMessageHandlers as getMcpMessageHandlers } from './mcp/mcp';
import { getMessageHandlers as getCommonMessageHandlers } from './errors/handlers';

export class TelnetClient implements ITelnetClient, TelnetMessageSender, ConnectionStateChanger {
    private telnetSocket: ITelnetSocket;

    private logging = false;
    private state: ConnectionState = ConnectionState.undefined;
    private stateData: undefined | ErrorStateData | VerbCodeStateData;

    private messageHandlers = getCommonMessageHandlers(this).concat(getMcpMessageHandlers(this, this));

    private constructor(telnetSocket: ITelnetSocket) {
        this.telnetSocket = telnetSocket;
    }

    public static create(telnetSocket?: ITelnetSocket): ITelnetClient {
        if (!telnetSocket) {
            return new TelnetClient(new TelnetSocket(new Socket()));
        }

        return new TelnetClient(telnetSocket);
    }

    public changeState(newState: ConnectionState, stateData?: ErrorStateData | VerbCodeStateData): void {
        this.state = newState;

        if (stateData) {
            this.stateData = stateData;
        }
    }

    public getState(): ConnectionState {
        return this.state;
    }

    public getStateData(): undefined | ErrorStateData | VerbCodeStateData {
        return this.stateData;
    }

    private log(message: string) {
        if (this.logging) {
            console.log(message);
        }
    }

    public enableDebugLogging() {
        this.logging = true;
    }

    public send(message: string) {
        this.log(`>SEND: ${message}`);
        this.telnetSocket.write(message + '\r\n');
    }

    public connect(ipAddress: string, port: number, user: string, password: string) {
        this.telnetSocket.on('connect', () => {
            this.log('Connected!');
            this.send(`co ${user} ${password}`);
        });

        this.telnetSocket.on('close', () => {
            this.log('Connection closed!');
            this.telnetSocket.destroy();
        });

        this.telnetSocket.on('error', error => {
            const name = error.name;
            const message = error.message;
            const stack = error.stack;

            const stackLines = stack?.split('\n');

            this.log('<ERROR:');
            this.log(`error-name: ${name}`);
            this.log(`error-message: ${message}`);

            if (!stackLines) {
                return;
            }

            this.log('error-stack:');
            for (let i = 1; i < stackLines.length; i++) {
                this.log(stackLines[i]);
            }
        });

        this.telnetSocket.on('do', option => {
            this.log(`<DO: '${option}'`);
            this.log(`>DONT: '${option}'`);
            this.telnetSocket.writeDont(option);
        });

        this.telnetSocket.on('dont', option => {
            this.log(`<DONT: '${option}'`);
        });

        this.telnetSocket.on('will', option => {
            this.log(`<WILL: '${option}'`);
            this.log(`>WONT: '${option}'`);
            this.telnetSocket.writeWont(option);
        });

        this.telnetSocket.on('wont', option => {
            this.log(`<WONT: '${option}'`);
        });

        this.telnetSocket.on('sub', (option, buffer) => {
            this.log(`<SUB: '${option}'`);
            this.log(`<Buffer: ${buffer.toString('utf8')}`);
        });

        this.telnetSocket.on('command', command => {
            this.log(`<COMMAND: ${command}}`);
        });

        this.telnetSocket.on('drain', () => {
            this.log('<DRAIN');
        });

        this.telnetSocket.on('end', () => {
            this.log('<END');
        });

        this.telnetSocket.on('lookup', () => {
            this.log('<LOOKUP');
        })

        this.telnetSocket.on('timeout', () => {
            this.log('<TIMEOUT');
        })

        this.telnetSocket.on('data', async buffer => {
            const data = buffer.toString('utf8');

            const lines = data.split('\r\n');
            for (const line of lines) {
                this.log(`<DATA: '${line}'`);

                for (const handler of this.messageHandlers) {
                    if (handler.handle(line)) {
                        break;
                    }
                }
            }
        });

        this.log('Connecting...');
        this.telnetSocket.connect(port, ipAddress);
    }
}