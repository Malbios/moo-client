import { BuiltinFunctionData, MooClient as IMooClient } from './interfaces';
import { init } from './moo/sync';
import {
    ConnectionState,
    ErrorCode,
    ErrorStateData,
    TelnetClient as ITelnetClient,
    MultilineResult,
    isErrorStateData
} from './telnet/interfaces';
import { TelnetClient } from './telnet/telnet-client';

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

    public disableMcp() {
        this.telnetClient.disableMcp();
    }

    public async connect(): Promise<null | ErrorStateData> {
        this.telnetClient.connect(this.serverAddress, this.serverPort, this.user, this.password);

        while (this.telnetClient.getState() == ConnectionState.connecting) {
            await delay(1);
        }

        if (this.telnetClient.getState() == ConnectionState.error) {
            return { code: ErrorCode.generic, message: 'could not connect' };
        }

        return null;
    }

    public async disconnect(): Promise<null | ErrorStateData> {
        this.telnetClient.send('@quit');

        while (this.telnetClient.getState() == ConnectionState.connected) {
            await delay(1);
        }

        if (this.telnetClient.getState() == ConnectionState.error) {
            return this.getErrorStateData();
        }

        if (this.telnetClient.getState() != ConnectionState.disconnected) {
            return { code: ErrorCode.generic, message: `unexpected connection state: '${this.telnetClient.getState()}'` };
        }

        return null;
    }

    public async eval(code: string): Promise<MultilineResult | ErrorStateData> {
        const result = await this.getMultilineResult(`;;me:mcp_eval("${code}");`);

        this.telnetClient.changeState(ConnectionState.connected);

        return result;
    }

    public async testEval(code: string): Promise<MultilineResult | ErrorStateData> {
        const result = await this.getMultilineResult(`;;${code}`);

        this.telnetClient.changeState(ConnectionState.connected);

        return result;
    }

    public async initSync(folderPath: string) {
        await init(folderPath, (x: string) => this.testEval(x));
    }

    public async getVerbCode(object: string, verb: string): Promise<string[] | ErrorStateData> {
        const command = `return verb_code(${object}, \\"${verb}\\");`;

        const verbCodeData = await this.eval(command);
        if (isErrorStateData(verbCodeData)) {
            return verbCodeData;
        }

        return verbCodeData.lines;
    }

    public async getBuiltinFunctionsDocumentation(): Promise<BuiltinFunctionData[] | ErrorStateData> {
        const helpDatabases = await this.eval('return $help:index_list();');
        if (isErrorStateData(helpDatabases)) {
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
            return { code: ErrorCode.generic, message: 'could not find builtin-index help object' };
        }

        const bfFunctions = await this.eval(`return ${bf_help_db_object_id}:find_topics();`);
        if (isErrorStateData(bfFunctions)) {
            return bfFunctions;
        }

        const bfData: BuiltinFunctionData[] = [];

        for (const line of bfFunctions.lines) {
            const functionDocumentation = await this.eval(`return ${bf_help_db_object_id}:get_topic(\\"${line}\\");`);
            if (isErrorStateData(functionDocumentation)) {
                return functionDocumentation;
            }

            bfData.push({ name: line.substring(0, line.length - 2), description: functionDocumentation.lines.join('\n') });
        }

        return bfData;
    }

    private async getMultilineResult(command: string): Promise<MultilineResult | ErrorStateData> {
        if (this.telnetClient.getState() != ConnectionState.connected) {
            return { code: ErrorCode.generic, message: 'client is not connected' };
        }

        this.telnetClient.send(command);

        while (this.telnetClient.getState() == ConnectionState.connected) {
            await delay(1);
        }

        if (this.telnetClient.getState() == ConnectionState.error) {
            return this.getErrorStateData();
        }

        if (this.telnetClient.getState() != ConnectionState.multilineResult) {
            return { code: ErrorCode.generic, message: `unexpected connection state: '${this.telnetClient.getState()}'` };
        }

        const stateData = this.telnetClient.getStateData() as MultilineResult;
        if (!stateData) {
            return { code: ErrorCode.generic, message: 'unexpected multiline result state with no data' };
        }

        this.telnetClient.changeState(ConnectionState.connected);

        return stateData;
    }

    private getErrorStateData(): ErrorStateData {
        if (this.telnetClient.getState() != ConnectionState.error) {
            return { code: ErrorCode.generic, message: `unexpected connection state: '${this.telnetClient.getState()}'` };
        }

        const errorStateData = this.telnetClient.getStateData();
        if (!isErrorStateData(errorStateData)) {
            return { code: ErrorCode.generic, message: 'unexpected error state with no data' };
        }

        return errorStateData;
    }
}