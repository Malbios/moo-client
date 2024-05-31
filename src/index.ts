import {
    ConnectionState,
    ErrorStateData,
    TelnetClient as ITelnetClient,
    MultilineResultStateData
} from './telnet/interfaces';
import { TelnetClient } from './telnet/telnet-client';

import { BuiltinFunctionData, MooClient as IMooClient, VerbData } from './interfaces';

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

    public async connect() {
        this.telnetClient.connect(this.serverAddress, this.serverPort, this.user, this.password);

        while (this.telnetClient.getState() == ConnectionState.connecting) {
            await delay(1);
        }

        if (this.telnetClient.getState() == ConnectionState.error) {
            throw Error('could not connect');
        }
    }

    public disconnect() {
        this.telnetClient.send('@quit');
    }

    private async getMultilineResult(command: string): Promise<MultilineResultStateData | Error> {
        if (this.telnetClient.getState() != ConnectionState.connected) {
            return new Error('client is not connected');
        }

        this.telnetClient.send(command);

        while (this.telnetClient.getState() == ConnectionState.connected) {
            await delay(1);
        }

        if (this.telnetClient.getState() != ConnectionState.multilineResult) {
            if (this.telnetClient.getState() == ConnectionState.error) {
                const stateData = this.telnetClient.getStateData() as ErrorStateData;
                if (!stateData) {
                    return new Error('unexpected error state with no data');
                }

                return Error(stateData.message);
            }

            return new Error('unexpected client state');
        }

        const stateData = this.telnetClient.getStateData() as MultilineResultStateData;
        if (!stateData) {
            return new Error('unexpected multiline result state with no data');
        }

        this.telnetClient.changeState(ConnectionState.connected);

        return stateData;
    }

    public async getBuiltinFunctionsData(): Promise<BuiltinFunctionData[] | Error> {
        const helpDatabases = await this.getMultilineResult(';me:mcp_eval("return $help:index_list();");');
        if (helpDatabases instanceof Error) {
            return helpDatabases;
        }

        let bf_help_db_object_id = '';
        for (const line of helpDatabases.lines) {
            const match = line.match(/^builtin-index.*\((\#\d+)\)$/);
            if (match) {
                bf_help_db_object_id = match[1];
                break;
            }
        }

        if (bf_help_db_object_id === '') {
            throw Error('could not find builtin-index help object');
        }

        const bfFunctions = await this.getMultilineResult(`;me:mcp_eval("return ${bf_help_db_object_id}:find_topics();");`);
        if (bfFunctions instanceof Error) {
            return bfFunctions;
        }

        const bfData: BuiltinFunctionData[] = [];

        for (const line of bfFunctions.lines) {
            const functionDocumentation = await this.getMultilineResult(`;me:mcp_eval("return ${bf_help_db_object_id}:get_topic(\\"${line}\\");");`);
            if (functionDocumentation instanceof Error) {
                return functionDocumentation;
            }

            bfData.push({ name: line.substring(0, line.length - 2), description: functionDocumentation.lines.join('\n') });
        }

        return bfData;
    }

    public async getVerbData(object: string, verb: string): Promise<VerbData | Error> {
        const verbCodeData = await this.getMultilineResult(`@edit ${object}:${verb}`);
        if (verbCodeData instanceof Error) {
            return verbCodeData;
        }

        return { reference: verbCodeData.reference, name: verbCodeData.name, code: verbCodeData.lines };
    }
}