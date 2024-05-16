import { suite, test } from 'mocha';
import { fail } from 'assert';
import { expect } from 'chai';
import { mock as createMock, instance, when, verify, anything } from 'ts-mockito';

import { ConnectionState, TelnetSocket as ITelnetSocket, VerbCodeStateData } from '../src/telnet/interfaces';
import { TelnetClient } from '../src/telnet/telnet-client';
import { MCP_AUTH_KEY } from '../src/telnet/mcp/constants';

/*
    on(name: 'command', callback: (command: number) => void): void;
    on(name: 'do' | 'dont' | 'will' | 'wont', callback: (option: number) => void): void;
    on(name: 'sub', callback: (option: number, buffer: Buffer) => void): void;
    on(name: 'close', callback: (hadError: boolean) => void): void;
    on(name: 'connect' | 'drain' | 'end' | 'lookup' | 'timeout', callback: () => void): void;
    on(name: 'data', callback: (data: Buffer | string) => void): void;
    on(name: 'error', callback: (e: Error) => void): void;
*/

suite('TelnetClient unit tests', () => {
    test('should be created with no errors', () => {
        const mockedTelnetSocket = createMock<ITelnetSocket>();
        const mockedTelnetSocketInstance = instance(mockedTelnetSocket);

        TelnetClient.create(mockedTelnetSocketInstance);
    });

    test('should be able to connect to a telnet server', async () => {
        const mockedTelnetSocket = createMock<ITelnetSocket>();

        let connectCallback: (() => void) | undefined = undefined;
        let dataCallback: ((data: Buffer | string) => void) | undefined = undefined;

        when(mockedTelnetSocket.on(anything(), anything())).thenCall((event, callback) => {
            if (event == 'connect') {
                connectCallback = callback as () => void;
            } else if (event == 'data') {
                dataCallback = callback;
            }
        });

        const mockedTelnetSocketInstance = instance(mockedTelnetSocket);

        const client = TelnetClient.create(mockedTelnetSocketInstance);

        client.connect('server', 123, 'user', 'pass');

        verify(mockedTelnetSocket.connect(123, 'server')).called();

        if (!connectCallback) {
            fail();
        }

        (connectCallback as () => void)();

        verify(mockedTelnetSocket.write('co user pass\r\n')).called();

        if (!dataCallback) {
            fail();
        }

        (dataCallback as (data: Buffer | string) => void)(Buffer.from(`#$#mcp-negotiate-end ${MCP_AUTH_KEY}`, 'utf8'));

        expect(client.getState()).to.equal(ConnectionState.connected);
    });

    test('should be able to handle multiline mcp data', async () => {
        const mockedTelnetSocket = createMock<ITelnetSocket>();

        let connectCallback: (() => void) | undefined = undefined;
        let dataCallback: ((data: Buffer | string) => void) | undefined = undefined;

        when(mockedTelnetSocket.on(anything(), anything())).thenCall((event, callback) => {
            if (event == 'connect') {
                connectCallback = callback as () => void;
            } else if (event == 'data') {
                dataCallback = callback;
            }
        });

        const mockedTelnetSocketInstance = instance(mockedTelnetSocket);

        const client = TelnetClient.create(mockedTelnetSocketInstance);

        client.connect('server', 123, 'user', 'pass');

        if (!connectCallback) {
            fail();
        }

        (connectCallback as () => void)();

        if (!dataCallback) {
            fail();
        }

        const castDataCallback = dataCallback as (data: Buffer | string) => void;

        castDataCallback(Buffer.from(`#$#mcp-negotiate-end ${MCP_AUTH_KEY}`, 'utf8'));

        castDataCallback(Buffer.from(`#$#dns-org-mud-moo-simpleedit-content ${MCP_AUTH_KEY} reference: "x" name: "y" type: moo-code content*: "" _data-tag: 123`, 'utf8'));
        castDataCallback(Buffer.from('#$#* 123 content: code code 1', 'utf8'));
        castDataCallback(Buffer.from('#$#* 123 content: 2 code code', 'utf8'));
        castDataCallback(Buffer.from('#$#* 123 content: code 3 code', 'utf8'));
        castDataCallback(Buffer.from('#$#: 123', 'utf8'));

        expect(client.getState()).to.equal(ConnectionState.multilineResult);

        const stateData = client.getStateData() as VerbCodeStateData;

        expect(stateData.reference).to.equal('x');
        expect(stateData.name).to.equal('y');

        expect(stateData.lines).to.have.length(3);

        expect(stateData.lines[0]).to.equal('code code 1');
        expect(stateData.lines[1]).to.equal('2 code code');
        expect(stateData.lines[2]).to.equal('code 3 code');
    });
});