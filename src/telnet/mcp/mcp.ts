import { ConnectedHandler, MultilineResultHandler, TelnetMessageSender } from "../interfaces";
import { McpMultilineHandler } from "./mcp-multiline";

import {
    McpNegotiateStartHandler,
    McpNegotiationCordHandler,
    McpNegotiationEndHandler,
    McpNegotiationNegotiateHandler,
    McpNegotiationSimpleEditHandler
} from "./mcp-negotiate";

export function getMessageHandlers(
    telnetMessageSender: TelnetMessageSender,
    connectedHandler: ConnectedHandler,
    multilineResultHandler: MultilineResultHandler
) {
    return [
        new McpNegotiateStartHandler(telnetMessageSender),
        new McpNegotiationNegotiateHandler(telnetMessageSender),
        new McpNegotiationCordHandler(telnetMessageSender),
        new McpNegotiationSimpleEditHandler(telnetMessageSender),
        new McpNegotiationEndHandler(telnetMessageSender, connectedHandler),
        new McpMultilineHandler(telnetMessageSender, multilineResultHandler)
    ];
}