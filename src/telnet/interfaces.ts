import { Socket } from 'net';

export interface TelnetClient {
    changeState(newState: ConnectionState, stateData?: ErrorStateData | MultilineResult): void;
    getState(): ConnectionState;
    getStateData(): undefined | ErrorStateData | MultilineResult;
    enableDebugLogging(): void;
    send(message: string): void;
    connect(ipAddress: string, port: number, user: string, password: string): void;
}

export interface TelnetSocket {
    writeCommand(command: number): void;
    writeDo(option: number): void;
    writeDont(option: number): void;
    writeWill(option: number): void;
    writeWont(option: number): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeSub(option: number, buffer: any): void;
    on(name: 'command', callback: (command: number) => void): void;
    on(name: 'do' | 'dont' | 'will' | 'wont', callback: (option: number) => void): void;
    on(name: 'sub', callback: (option: number, buffer: Buffer) => void): void;
    on(name: 'close', callback: (hadError: boolean) => void): void;
    on(name: 'connect' | 'drain' | 'end' | 'lookup' | 'timeout', callback: () => void): void;
    on(name: 'data', callback: (data: Buffer | string) => void): void;
    on(name: 'error', callback: (e: Error) => void): void;
    connect(port: number, host?: string, listener?: () => void): Socket;
    destroy(error?: Error): Socket;
    end(data?: string, encoding?: string, callback?: () => void): Socket;
    end(data?: Buffer | Uint8Array, callback?: () => void): Socket;
    pause(): Socket;
    ref(): Socket;
    resume(): Socket;
    setEncoding(encoding?: string): Socket;
    setKeepAlive(enable?: boolean, initialDelay?: number): Socket;
    setNoDelay(noDelay?: boolean): Socket;
    setTimeout(timeout: number, callback: () => void): Socket;
    unref(): Socket;
    write(data: string, encoding?: string, callback?: () => void): boolean;
    write(data: Buffer | Uint8Array, callback?: () => void): boolean;
}

export interface TelnetMessageSender {
    send(message: string): void;
}

export interface ConnectionStateChanger {
    changeState(newState: ConnectionState, data?: ErrorStateData | MultilineResult): void;
}

export interface MessageHandler {
    handle(message: string): boolean;
}

export interface DataHandler {
    handle(data: string): void;
}

export interface ErrorStateData {
    code: ErrorCode;
    message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isErrorStateData(item: any): item is ErrorStateData {
    return 'code' in item && 'message' in item;
}

export interface MultilineResult {
    reference: string;
    name: string;
    type: string;
    lines: string[];
}

export enum ConnectionState {
    undefined,
    error,
    connecting,
    connected,
    multilineResult,
    disconnected
}

export enum ErrorCode {
    generic,
    mcpEvalFailed,
    syntaxError,
    varNotFound,
    verbNotFound
}