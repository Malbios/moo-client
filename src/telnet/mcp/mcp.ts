import { ConnectionStateChanger, MessageHandler, TelnetMessageSender } from '../interfaces';
import { McpMultilineHandler } from './mcp-multiline';

import {
    McpNegotiateStartHandler,
    McpNegotiationCordHandler,
    McpNegotiationEndHandler,
    McpNegotiationNegotiateHandler,
    McpNegotiationSimpleEditHandler
} from './mcp-negotiate';

export function getMessageHandlers(
    telnetMessageSender: TelnetMessageSender,
    connectionStateChanger: ConnectionStateChanger
): MessageHandler[] {
    return [
        new McpNegotiateStartHandler(telnetMessageSender),
        new McpNegotiationNegotiateHandler(telnetMessageSender),
        new McpNegotiationCordHandler(telnetMessageSender),
        new McpNegotiationSimpleEditHandler(telnetMessageSender),
        new McpNegotiationEndHandler(telnetMessageSender, connectionStateChanger),
        new McpMultilineHandler(telnetMessageSender, connectionStateChanger)
    ];
}