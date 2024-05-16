import { ConnectionState, ConnectionStateChanger, ErrorCode, MessageHandler } from '../interfaces';

export class VerbNotFoundHandler implements MessageHandler {
    private connectionStateChanger: ConnectionStateChanger;

    constructor(connectionStateChanger: ConnectionStateChanger) {
        this.connectionStateChanger = connectionStateChanger;
    }

    handle(message: string): boolean {
        const match = message.match(/That object does not define that verb\./);
        if (!match) {
            return false;
        }

        this.connectionStateChanger.changeState(ConnectionState.error,
            { code: ErrorCode.verbNotFound, message: 'That object does not define that verb.' });

        return true;
    }
}