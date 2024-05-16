import { MessageHandler, TelnetMessageSender } from '../interfaces';

export class McpMessageHandler implements MessageHandler {
    private telnetMessageSender: TelnetMessageSender;

    constructor(messageSender: TelnetMessageSender) {
        this.telnetMessageSender = messageSender;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public handle(message: string): boolean {
        throw new Error('Method not implemented.');
    }

    protected sendMcpMessage(message: string): void {
        this.telnetMessageSender.send(`#$#${message}`);
    }
}