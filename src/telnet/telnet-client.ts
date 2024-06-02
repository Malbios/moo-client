import { Socket } from 'net';
import { TelnetSocket } from 'telnet-stream';

import { ErrorHandler } from './handlers/error';
import { McpDataHandler } from './handlers/mcp';
import {
    ConnectionState,
    ConnectionStateChanger,
    DataHandler,
    ErrorStateData,
    TelnetClient as ITelnetClient,
    TelnetSocket as ITelnetSocket,
    MultilineResult,
    TelnetMessageSender
} from './interfaces';


export class TelnetClient implements ITelnetClient, TelnetMessageSender, ConnectionStateChanger {
    private _telnetSocket: ITelnetSocket;

    private _logging = false;
    private _state: ConnectionState = ConnectionState.undefined;
    private _stateData: undefined | ErrorStateData | MultilineResult;

    private _data = '';
    private _dataHandlers: DataHandler[];

    private constructor(telnetSocket: ITelnetSocket) {
        this._telnetSocket = telnetSocket;

        this._dataHandlers = [new McpDataHandler(this, this), new ErrorHandler(this)];
    }

    public static create(telnetSocket?: ITelnetSocket): ITelnetClient {
        if (!telnetSocket) {
            const socket = new Socket();
            const telnetSocket = new TelnetSocket(socket);

            return new TelnetClient(telnetSocket);
        }

        return new TelnetClient(telnetSocket);
    }

    public changeState(newState: ConnectionState, stateData?: ErrorStateData | MultilineResult): void {
        this._state = newState;
        this._stateData = stateData;
    }

    public getState(): ConnectionState {
        return this._state;
    }

    public getStateData(): undefined | ErrorStateData | MultilineResult {
        return this._stateData;
    }

    private log(message: string) {
        if (this._logging) {
            console.log(message);
        }
    }

    public enableDebugLogging() {
        this._logging = true;
    }

    public send(message: string) {
        this.log(`>SEND: ${message}`);
        this._telnetSocket.write(message + '\r\n');
    }

    public connect(ipAddress: string, port: number, user: string, password: string) {
        this.changeState(ConnectionState.connecting);

        this._telnetSocket.on('connect', () => {
            this.log('Connected!');
            this.send(`co ${user} ${password}`);
        });

        this._telnetSocket.on('close', () => {
            this.log('Connection closed!');
            this._telnetSocket.destroy();
            this.changeState(ConnectionState.disconnected);
        });

        this._telnetSocket.on('error', error => {
            const name = error.name;
            const message = error.message;
            const stack = error.stack;

            const stackLines = stack?.split('\n');

            this.log('<TELNET ERROR:');
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

        this._telnetSocket.on('do', option => {
            this.log(`<DO: '${option}'`);
            this.log(`>DONT: '${option}'`);
            this._telnetSocket.writeDont(option);
        });

        this._telnetSocket.on('dont', option => {
            this.log(`<DONT: '${option}'`);
        });

        this._telnetSocket.on('will', option => {
            this.log(`<WILL: '${option}'`);
            this.log(`>WONT: '${option}'`);
            this._telnetSocket.writeWont(option);
        });

        this._telnetSocket.on('wont', option => {
            this.log(`<WONT: '${option}'`);
        });

        this._telnetSocket.on('sub', (option, buffer) => {
            this.log(`<SUB: '${option}'`);
            this.log(`<Buffer: ${buffer.toString('utf8')}`);
        });

        this._telnetSocket.on('command', command => {
            this.log(`<COMMAND: ${command}}`);
        });

        this._telnetSocket.on('drain', () => {
            this.log('<DRAIN');
        });

        this._telnetSocket.on('end', () => {
            this.log('<END');
        });

        this._telnetSocket.on('lookup', () => {
            this.log('<LOOKUP');
        });

        this._telnetSocket.on('timeout', () => {
            this.log('<TIMEOUT');
        });

        this._telnetSocket.on('data', async buffer => {
            const data = buffer.toString('utf8');

            const charCode = data[data.length - 1].charCodeAt(0);
            if (charCode != 10) {
                this._data += data;
                return;
            }

            const fullData = this._data + data;
            this._data = '';

            for (const handler of this._dataHandlers) {
                handler.handle(fullData);
            }
        });

        this.log('Connecting...');
        this._telnetSocket.connect(port, ipAddress);
    }
}