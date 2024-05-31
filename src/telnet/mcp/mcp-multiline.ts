import { MCP_AUTH_KEY } from './constants';

import {
    ConnectionState,
    ConnectionStateChanger,
    TelnetMessageSender
} from '../interfaces';

import { McpMessageHandler } from './mcp-message-handler';

class MultilineResult {
    public reference = '';
    public name = '';
    public type = '';
    public lines: string[] = [];
}

class MultilineData {
    private dataTag: string;
    private data: MultilineResult;

    constructor(reference: string, name: string, type: string, dataTag: string) {
        this.data = { reference: reference, name: name, type: type, lines: [] };
        this.dataTag = dataTag;
    }

    private hasFinished(): boolean {
        if (this.dataTag === '') {
            return true;
        }

        return false;
    }

    public getDataTag(): string {
        return this.dataTag;
    }

    public finish() {
        this.dataTag = '';
    }

    public addLine(line: string) {
        if (this.dataTag === '') {
            throw Error('multiline data not started');
        }

        this.data.lines.push(line);
    }

    public getData(): MultilineResult {
        if (!this.hasFinished()) {
            throw Error('multiline data not finished');
        }

        return this.data;
    }
}

export class McpMultilineHandler extends McpMessageHandler {
    private regexPattern_multiline_start_generic = `^#\\$#dns-org-mud-moo-simpleedit-content ${MCP_AUTH_KEY} reference: ([^ ]+) name: ([^ ]+) type: ([^ ]+) content\\*: \\"\\" _data-tag: (\\d+)$`;
    private regexPattern_multiline_start_moocode = `^#\\$#dns-org-mud-moo-simpleedit-content ${MCP_AUTH_KEY} reference: \\"([^\\"]+)\\" name: \\"([^\\"]+)\\" type: moo-code content\\*: \\"\\" _data-tag: (\\d+)$`;

    private memory: MultilineData[] = [];

    private connectionStateChanger: ConnectionStateChanger;

    constructor(sender: TelnetMessageSender, connectionStateChanger: ConnectionStateChanger) {
        super(sender);

        this.connectionStateChanger = connectionStateChanger;
    }

    public handle(message: string): boolean {
        if (this.handleStart(message)) {
            return true;
        }

        if (this.handleContinue(message)) {
            return true;
        }

        if (this.handleEnd(message)) {
            return true;
        }

        return false;
    }

    private handleStart(message: string): boolean {
        const regex_generic = new RegExp(this.regexPattern_multiline_start_generic, '');
        const regex_moocode = new RegExp(this.regexPattern_multiline_start_moocode, '');

        const match_moocode = regex_moocode.exec(message);
        if (match_moocode) {
            const reference = match_moocode[1];
            const name = match_moocode[2];
            const dataTag = match_moocode[3];

            const existingMultilineData = this.memory.find(x => x.getDataTag() === dataTag);
            if (existingMultilineData) {
                throw Error(`found existing data for tag: ${dataTag}`);
            }

            this.memory.push(new MultilineData(reference, name, 'moo-code', dataTag));

            return true;
        }

        const match_generic = regex_generic.exec(message);
        if (match_generic) {
            const reference = match_generic[1];
            const name = match_generic[2];
            const type = match_generic[3];
            const dataTag = match_generic[4];

            const existingMultilineData = this.memory.find(x => x.getDataTag() === dataTag);
            if (existingMultilineData) {
                throw Error(`found existing data for tag: ${dataTag}`);
            }

            this.memory.push(new MultilineData(reference, name, type, dataTag));

            return true;
        }

        return false;
    }

    private handleContinue(message: string): boolean {
        const match = message.match(/^#\$#\* (\d+) content: (.*)$/);
        if (!match) {
            return false;
        }

        const dataTag = match[1];
        const data = match[2];

        const existingMultilineData = this.memory.find(x => x.getDataTag() === dataTag);
        if (!existingMultilineData) {
            throw Error(`found no data for tag: ${dataTag}`);
        }

        existingMultilineData.addLine(data);

        return true;
    }

    private handleEnd(message: string): boolean {
        const match = message.match(/^#\$#: (\d+)$/);
        if (!match) {
            return false;
        }

        const dataTag = match[1];

        const foundIndex = this.memory.findIndex(x => x.getDataTag() === dataTag);
        if (foundIndex < 0) {
            throw Error(`found no data for tag: ${dataTag}`);
        }

        const existingMultilineData = this.memory[foundIndex];

        this.memory.splice(foundIndex, 1);

        existingMultilineData.finish();

        const multilineData = existingMultilineData.getData();
        const stateData = {
            reference: multilineData.reference,
            name: multilineData.name,
            type: multilineData.type,
            lines: multilineData.lines
        };

        this.connectionStateChanger.changeState(ConnectionState.multilineResult, stateData);

        return true;
    }
}