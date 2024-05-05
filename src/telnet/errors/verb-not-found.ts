import { ConnectionState, ConnectionStateChanger, MessageHandler } from "../interfaces";

export class VerbNotFoundHandler implements MessageHandler {
    private connectionStateChanger: ConnectionStateChanger;

    constructor(connectionStateChanger: ConnectionStateChanger) {
        this.connectionStateChanger = connectionStateChanger;
    }

    handle(message: string): boolean {
        let match = message.match(/That object does not define that verb\./);
        if (!match) {
            return false;
        }

        this.connectionStateChanger.changeState(ConnectionState.error,
            { code:'VerbNotFound', message: "That object does not define that verb." });

        return true;
    }
}