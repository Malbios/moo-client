import { fail } from 'assert';
import { expect } from 'chai';

import MooClient from '../../src/index';
import { getServerCredentials } from '../test-utils/secrets';

function getDefaultMooClient(): MooClient {
    const credentials = getServerCredentials();

    return MooClient.create(credentials.serverAddress, credentials.serverPort, credentials.serverUsername, credentials.serverPassword);
}

describe('MooClient integration tests', () => {
    it('should be created with no errors', () => {
        getDefaultMooClient();
    });

    it('should return expected verb data for given verb info', async () => {
        const client = getDefaultMooClient();

        //client.enableDebugging();

        const result = await client.getVerbData('me', 'test');

        expect(result.reference).to.equal('#129:test');
        expect(result.name).to.equal('ServiceAccount:test');
        expect(result.code).to.have.length(2);
        expect(result.code[0]).to.equal('"Usage: test()";');
        expect(result.code[1]).to.equal('player:tell("test");');
    });

    it('should throw expected error for invalid object in verb info', async () => {
        const client = getDefaultMooClient();

        try {
            await client.getVerbData('DoesNotExist', 'test');
            fail();
        } catch (exception) {
            const error = exception as Error;
            expect(error.message).to.equal('I see no "DoesNotExist" here.');
        }
    });

    it('should throw expected error for invalid verb in verb info', async () => {
        const client = getDefaultMooClient();

        try {
            await client.getVerbData('me', 'DefinitelyDoesNotExist');
            fail();
        } catch (exception) {
            const error = exception as Error;
            expect(error.message).to.equal('That object does not define that verb.');
        }
    });
});