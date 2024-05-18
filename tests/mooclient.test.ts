import { fail } from 'assert';
import { suite, test } from 'mocha';
import { expect } from 'chai';
import { mock as createMock, instance, when, verify } from 'ts-mockito';

import { MooClient } from '../src/index';
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
            .thenReturn(ConnectionState.undefined)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.undefined)
            .thenReturn(ConnectionState.multilineResult);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ reference: expectedReference, name: expectedName, lines: expectedCode });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);
        const result = await client.getVerbData('me', 'test');

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send('@edit me:test')).called();

        expect(result.reference).to.equal(expectedReference);
        expect(result.name).to.equal(expectedName);
        expect(result.code).to.have.length(expectedCode.length);

        for (let i = 0; i < expectedCode.length; i++) {
            expect(result.code[i]).to.equal(expectedCode[i]);
        }
    });

    test('should throw expected error for invalid verb in verb info', async () => {
        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.undefined)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.undefined)
            .thenReturn(ConnectionState.error);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ code: ErrorCode.objectNotFound, message: 'That object does not define that verb.' });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        try {
            await client.getVerbData('me', 'DefinitelyDoesNotExist');
            fail();
        } catch (exception) {
            const error = exception as Error;
            expect(error.message).to.equal('That object does not define that verb.');
        }

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send('@edit me:DefinitelyDoesNotExist')).called();
    });

    test('should throw expected error for invalid object in verb info', async () => {
        const mockedTelnetClient = createMock<ITelnetClient>();

        when(mockedTelnetClient.getState())
            .thenReturn(ConnectionState.undefined)
            .thenReturn(ConnectionState.connected)
            .thenReturn(ConnectionState.undefined)
            .thenReturn(ConnectionState.error);

        when(mockedTelnetClient.getStateData())
            .thenReturn({ code: ErrorCode.objectNotFound, message: 'I see no "DoesNotExist" here.' });

        const mockedTelnetClientInstance = instance(mockedTelnetClient);

        const client = MooClient.create('server', 123, 'user', 'pass', mockedTelnetClientInstance);

        try {
            await client.getVerbData('DoesNotExist', 'test');
            fail();
        } catch (exception) {
            const error = exception as Error;
            expect(error.message).to.equal('I see no "DoesNotExist" here.');
        }

        verify(mockedTelnetClient.connect('server', 123, 'user', 'pass')).called();
        verify(mockedTelnetClient.send('@edit DoesNotExist:test')).called();
    });
});