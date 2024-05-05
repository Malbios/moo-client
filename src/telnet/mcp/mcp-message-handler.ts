import { MessageHandler, TelnetMessageSender } from "../interfaces";

export class McpMessageHandler implements MessageHandler {
    private telnetMessageSender: TelnetMessageSender;
    
    constructor(messageSender: TelnetMessageSender) {
        this.telnetMessageSender = messageSender;
    }

    public handle(_: string): boolean {
        throw new Error("Method not implemented.");
    }

    protected sendMcpMessage(message: string): void {
        this.telnetMessageSender.send(`#$#${message}`);
    }
}