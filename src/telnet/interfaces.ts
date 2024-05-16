export interface TelnetClient {
    changeState(newState: ConnectionState, stateData?: ErrorStateData | VerbCodeStateData): void;
    getState(): ConnectionState;
    getStateData(): undefined | ErrorStateData | VerbCodeStateData;
    enableDebugLogging(): void;
    send(message: string): void;
    connect(ipAddress: string, port: number, user: string, password: string): void;
}

export interface TelnetMessageSender {
    send(message: string): void;
}

export interface ConnectionStateChanger {
    changeState(newState: ConnectionState, data?: ErrorStateData | VerbCodeStateData): void;
}

export interface MessageHandler {
    handle(message: string): boolean;
}

export interface ErrorStateData {
    code: ErrorCode;
    message: string;
}

export interface VerbCodeStateData {
    reference: string;
    name: string;
    lines: string[];
}

export enum ConnectionState {
    undefined,
    connected,
    multilineResult,
    error
}

export enum ErrorCode {
    objectNotFound,
    verbNotFound
}