import { MCP_AUTH_KEY } from './constants';
import { ConnectionState, ConnectionStateChanger, TelnetMessageSender } from '../interfaces';

import { McpMessageHandler } from './mcp-message-handler';

class McpNegotiationMessageHandler extends McpMessageHandler {
    protected messagePattern = '';
    protected response = '';
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onHandled = () => { };

    public handle(message: string): boolean {
        const regex = new RegExp(this.messagePattern, '');
        const match = regex.exec(message);

        if (!match) {
            return false;
        }

        const actualResponse = this.response.replace('%MATCH_1%', match[1]).replace('%MATCH_2%', match[2]);
        this.sendMcpMessage(actualResponse);

        this.onHandled();

        return true;
    }
}

export class McpNegotiateStartHandler extends McpNegotiationMessageHandler {
    protected messagePattern = '^#\\$#mcp version: ([\\d\\.]+) to: ([\\d\\.]+)$';
    protected response = `mcp authentication-key: ${MCP_AUTH_KEY} version: %MATCH_1% to: %MATCH_2%`;
}

export class McpNegotiationNegotiateHandler extends McpNegotiationMessageHandler {
    protected messagePattern = `^#\\$#mcp-negotiate-can ${MCP_AUTH_KEY} package: mcp-negotiate min-version: ([\\d\\.]+) max-version: ([\\d\\.]+)$`;
    protected response = `mcp-negotiate-can ${MCP_AUTH_KEY} package: mcp-negotiate min-version: %MATCH_1% max-version: %MATCH_2%`;
}

export class McpNegotiationCordHandler extends McpNegotiationMessageHandler {
    protected messagePattern = `^#\\$#mcp-negotiate-can ${MCP_AUTH_KEY} package: mcp-cord min-version: ([\\d\\.]+) max-version: ([\\d\\.]+)$`;
    protected response = `mcp-negotiate-can ${MCP_AUTH_KEY} package: mcp-cord min-version: %MATCH_1% max-version: %MATCH_2%`;
}

export class McpNegotiationSimpleEditHandler extends McpNegotiationMessageHandler {
    protected messagePattern = `^#\\$#mcp-negotiate-can ${MCP_AUTH_KEY} package: dns-org-mud-moo-simpleedit min-version: ([\\d\\.]+) max-version: ([\\d\\.]+)$`;
    protected response = `mcp-negotiate-can ${MCP_AUTH_KEY} package: dns-org-mud-moo-simpleedit min-version: %MATCH_1% max-version: %MATCH_2%`;
}

export class McpNegotiationEndHandler extends McpNegotiationMessageHandler {
    protected messagePattern = `^#\\$#mcp-negotiate-end ${MCP_AUTH_KEY}$`;
    protected response = `mcp-negotiate-end ${MCP_AUTH_KEY}`;

    constructor(telnetMessageSender: TelnetMessageSender, connectionStateChanger: ConnectionStateChanger) {
        super(telnetMessageSender);
        this.onHandled = () => {
            connectionStateChanger.changeState(ConnectionState.connected);
        };
    }
}