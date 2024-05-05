import { MCP_AUTH_KEY } from './constants';

import {
    MultilineResult,
    MultilineResultHandler,
    TelnetMessageSender
} from "../interfaces";

import { McpMessageHandler } from "./mcp-message-handler";

// TODO: make more generic than simpleedit-content

class MultilineData {
    private dataTag: string;
    private data: MultilineResult;

    constructor(reference: string, name: string, dataTag: string) {
        this.data = { reference: reference, name: name, lines: [] };
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
    private regexPattern_multiline_start = `^#\\$#dns-org-mud-moo-simpleedit-content ${MCP_AUTH_KEY} reference: \\"([^\\"]+)\\" name: \\"([^\\"]+)\\" type: moo-code content\\*: \\"\\" _data-tag: (\\d+)$`;

    private memory: MultilineData[] = [];

    private onMultilineResultHandler: MultilineResultHandler;

    constructor(sender: TelnetMessageSender, onMultilineResult: MultilineResultHandler) {
        super(sender);
        
        this.onMultilineResultHandler = onMultilineResult;
    }
    
    public handle(message: string): boolean {
        if (this.handleStart(message)) {
            return true;
        }

        if (this.handleContinue(message)) {
            return true;
        }

        if(this.handleEnd(message)) {
            return true;
        }

        return false;
    }

    private handleStart(message: string): boolean {
        let regex = new RegExp(this.regexPattern_multiline_start, '');
        let match = regex.exec(message);
        if (!match) {
            return false;
        }

        let reference = match[1];
        let name = match[2];
        let dataTag = match[3];

        let existingMultilineData = this.memory.find(x => x.getDataTag() === dataTag);
        if (existingMultilineData) {
            throw Error(`found existing data for tag: ${dataTag}`);
        }
        
        this.memory.push(new MultilineData(reference, name, dataTag));

        return true;
    }

    private handleContinue(message: string): boolean {
        let match = message.match(/^#\$#\* (\d+) content: (.*)$/);
        if (!match) {
            return false;
        }

        let dataTag = match[1];
        let data = match[2];

        let existingMultilineData = this.memory.find(x => x.getDataTag() === dataTag);
        if (!existingMultilineData) {
            throw Error(`found no data for tag: ${dataTag}`);
        }

        existingMultilineData.addLine(data);

        return true;
    }

    private handleEnd(message: string): boolean {
        let match = message.match(/^#\$#: (\d+)$/);
        if (!match) {
            return false;
        }

        let dataTag = match[1];

        let existingMultilineData = this.memory.find(x => x.getDataTag() === dataTag);
        if (!existingMultilineData) {
            throw Error(`found no data for tag: ${dataTag}`);
        }

        existingMultilineData.finish();

        this.onMultilineResultHandler.onMultilineResult(existingMultilineData.getData());

        return true;
    }
}