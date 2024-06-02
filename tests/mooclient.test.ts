import { expect } from 'chai';
import { suite, test } from 'mocha';
import { mock as createMock, instance, verify, when } from 'ts-mockito';

import { fail } from 'assert';
import { MooClient } from '../src/index';
import { ConnectionState, ErrorCode, ErrorStateData, TelnetClient as ITelnetClient, isErrorStateData } from '../src/telnet/interfaces';

suite('MooClient unit tests', () => {
    test('should be created with no errors', () => {
        const mockedTelnetClient = createMock<ITelnetClient>();
        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        MooClient.create('', 0, '', '', mockedTelnetClientInstance);
    });

    test('should return verb code for a valid verb code request', async () => {
        const expectedCode = ['z', 'a'];

        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.multilineResult)
            .thenReturn(ConnectionState.multilineResult)
            .thenReturn(ConnectionState.multilineResult);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ reference: 'eval', name: 'eval', type: 'string', lines: expectedCode });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        await client.connect();

        const result = await client.getVerbCode('me', 'test');
        if (isErrorStateData(result)) {
            fail('result is an error');
        }

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send(';;me:mcp_eval("return verb_code(me, \\"test\\");");')).called();
        verify(mockedTelnetClient.changeState(ConnectionState.connected)).called();

        const code = result as string[];

        for (let i = 0; i < expectedCode.length; i++) {
            expect(code[i]).to.equal(expectedCode[i]);
        }
    });

    test('should throw expected error for invalid verb in verb info', async () => {
        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.error)
            .thenReturn(ConnectionState.error);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ code: ErrorCode.verbNotFound, message: 'Verb not found' });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        await client.connect();

        const result = await client.getVerbCode('me', 'DefinitelyDoesNotExist');

        const error = result as ErrorStateData;
        expect(error.code).to.equal(ErrorCode.verbNotFound);
        expect(error.message).to.contain('Verb not found');

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send(';;me:mcp_eval("return verb_code(me, \\"DefinitelyDoesNotExist\\");");')).called();
        verify(mockedTelnetClient.changeState(ConnectionState.connected)).called();
    });

    test('should throw expected error for invalid object in verb info', async () => {
        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.error)
            .thenReturn(ConnectionState.error);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ code: ErrorCode.varNotFound, message: 'Variable not found: DoesNotExist' });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        await client.connect();

        const result = await client.getVerbCode('DoesNotExist', 'test');

        const error = result as ErrorStateData;
        expect(error.code).to.equal(ErrorCode.varNotFound);
        expect(error.message).to.contain('Variable not found: DoesNotExist');

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send(';;me:mcp_eval("return verb_code(DoesNotExist, \\"test\\");");')).called();
        verify(mockedTelnetClient.changeState(ConnectionState.connected)).called();
    });
});