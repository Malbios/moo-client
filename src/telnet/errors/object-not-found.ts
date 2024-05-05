import { ConnectionState, ConnectionStateChanger, MessageHandler } from "../interfaces";

export class ObjectNotFoundHandler implements MessageHandler {
    private connectionStateChanger: ConnectionStateChanger;

    constructor(connectionStateChanger: ConnectionStateChanger) {
        this.connectionStateChanger = connectionStateChanger;
    }

    handle(message: string): boolean {
        let match = message.match(/I see no \"([^\"]+)\" here\./);
        if (!match) {
            return false;
        }

        this.connectionStateChanger.changeState(ConnectionState.error,
            { code:'ObjectNotFound', message: `I see no "${match[1]}" here.` });

        return true;
    }
}