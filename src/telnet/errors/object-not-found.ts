import { ConnectionState, ConnectionStateChanger, ErrorCode, MessageHandler } from '../interfaces';

export class ObjectNotFoundHandler implements MessageHandler {
    private connectionStateChanger: ConnectionStateChanger;

    constructor(connectionStateChanger: ConnectionStateChanger) {
        this.connectionStateChanger = connectionStateChanger;
    }

    handle(message: string): boolean {
        const match = message.match(/I see no \"([^\"]+)\" here\./);
        if (!match) {
            return false;
        }

        this.connectionStateChanger.changeState(ConnectionState.error,
            { code: ErrorCode.objectNotFound, message: `I see no "${match[1]}" here.` });

        return true;
    }
}