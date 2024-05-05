import { ConnectionStateChanger, MessageHandler } from "../interfaces";
import { ObjectNotFoundHandler } from "./object-not-found";
import { VerbNotFoundHandler } from "./verb-not-found";

export function getMessageHandlers(connectionStateChanger: ConnectionStateChanger): MessageHandler[] {
    return [
        new VerbNotFoundHandler(connectionStateChanger),
        new ObjectNotFoundHandler(connectionStateChanger)
    ];
}