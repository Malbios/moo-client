import { expect } from 'chai';
import { suite, test } from 'mocha';
import { mock as createMock, instance, verify, when } from 'ts-mockito';

import { MooClient } from '../src/index';
import { VerbData } from '../src/interfaces';
import { ConnectionState, ErrorCode, TelnetClient as ITelnetClient } from '../src/telnet/interfaces';

suite('MooClient unit tests', () => {
    test('should be created with no errors', () => {
        const mockedTelnetClient = createMock<ITelnetClient>();
        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        MooClient.create('', 0, '', '', mockedTelnetClientInstance);
    });

    test('should return verb code for a valid verb code request', async () => {
        const expectedName = 'x';
        const expectedReference = 'y';
        const expectedCode = ['z', 'a'];

        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.multilineResult)
            .thenReturn(ConnectionState.multilineResult);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ reference: expectedReference, name: expectedName, type: 'moo-code', lines: expectedCode });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        await client.connect();

        const result = await client.getVerbData('me', 'test');

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send('@edit me:test')).called();

        const verbData = result as VerbData;

        expect(verbData.reference).to.equal(expectedReference);
        expect(verbData.name).to.equal(expectedName);
        expect(verbData.code).to.have.length(expectedCode.length);

        for (let i = 0; i < expectedCode.length; i++) {
            expect(verbData.code[i]).to.equal(expectedCode[i]);
        }
    });

    test('should throw expected error for invalid verb in verb info', async () => {
        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.error);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ code: ErrorCode.objectNotFound, message: 'That object does not define that verb.' });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        await client.connect();

        const result = await client.getVerbData('me', 'DefinitelyDoesNotExist');

        const error = result as Error;
        expect(error.message).to.contain('That object does not define that verb');

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send('@edit me:DefinitelyDoesNotExist')).called();
    });

    test('should throw expected error for invalid object in verb info', async () => {
        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.connecting)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.error);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ code: ErrorCode.objectNotFound, message: 'I see no "DoesNotExist" here.' });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        await client.connect();

        const result = await client.getVerbData('DoesNotExist', 'test');

        const error = result as Error;
        expect(error.message).to.contain('I see no "DoesNotExist" here');

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send('@edit DoesNotExist:test')).called();
    });
});