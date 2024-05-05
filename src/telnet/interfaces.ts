export interface TelnetMessageSender {
    send(message: string): void;
}

export interface ConnectionStateChanger {
    changeState(newState: ConnectionState, data?: any): void;
}

export interface MessageHandler {
    handle(message: string): boolean;
}

export enum ConnectionState {
    undefined,
    connected,
    multilineResult,
    error
}

export interface ErrorStateData {
    message: string;
}

export interface MultilineResultStateData {
    reference: string;
    name: string;
    lines: string[];
}