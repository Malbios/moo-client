import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import MooClient from '../../src/index';
import { getServerCredentials } from '../test-utils/secrets';
import { TelnetClient } from '../../src/telnet/telnet-client';

const expect = chai.expect

chai.use(chaiAsPromised);

function getDefaultMooClient(): MooClient {
    const credentials = getServerCredentials();

    return new MooClient(new TelnetClient(), credentials.serverAddress, credentials.serverPort, credentials.serverUsername, credentials.serverPassword);
}

describe('MooClient integration tests', () => {
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

        await expect(client.getVerbData('DoesNotExist', 'test'))
            .to.be.rejectedWith('I see no "DoesNotExist" here.');
    });

    it('should throw expected error for invalid verb in verb info', async () => {
        const client = getDefaultMooClient();

        await expect(client.getVerbData('me', 'DefinitelyDoesNotExist'))
            .to.be.rejectedWith('That object does not define that verb.');
    });
});