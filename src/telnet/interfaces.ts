export interface TelnetMessageSender {
    send(message: string): void;
}

export interface ConnectedHandler {
    onConnected: () => void;
}

export interface MultilineResultHandler {
    onMultilineResult: (result: MultilineResult) => void;
}

export interface MessageHandler {
    handle(message: string): boolean;
}

export interface MultilineResult {
    reference: string;
    name: string;
    lines: string[];
}