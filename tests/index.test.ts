import 'jasmine';

import { MooClient } from '../dist/index';
import { getServerCredentials } from '../helpers/secrets';

function getDefaultMooClient(): MooClient {
    const credentials = getServerCredentials();

    return new MooClient(credentials.serverAddress, credentials.serverPort, credentials.serverUsername, credentials.serverPassword);
}

describe("MooClient Tests", async () => {
    it("should return expected verb data for given verb info", async () => {
        const client = getDefaultMooClient();

        // client.enableDebugging();
        
        const result = await client.getVerbData('me', 'test');

        expect(result.reference).toBe('#131:test');
        expect(result.name).toBe('ServiceAccount:test');
        expect(result.code).toHaveSize(2);
        expect(result.code[0]).toBe('"Usage: ;#131:test();";');
        expect(result.code[1]).toBe('player:tell("test");');
    });
    it("should throw expected error for invalid object in verb info", async () => {
        const client = getDefaultMooClient();

        // client.enableDebugging();

        const promise = client.getVerbData('DoesNotExist', 'test');

        await expectAsync(promise).toBeRejectedWithError('I see no "DoesNotExist" here.');
    });
    it("should throw expected error for invalid verb in verb info", async () => {
        const client = getDefaultMooClient();

        // client.enableDebugging();

        const promise = client.getVerbData('me', 'DefinitelyDoesNotExist');

        await expectAsync(promise).toBeRejectedWithError('That object does not define that verb.');
    });
});