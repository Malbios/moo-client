import 'jasmine';

import { MooClient } from './../dist/index';
import { getServerCredentials } from '../helpers/secrets';

describe("MooClient Tests", async () => {
    it("should return expected verb data for given verb info", async () => {
        const credentials = getServerCredentials();

        const client = new MooClient(credentials.serverAddress, credentials.serverPort, credentials.serverUsername, credentials.serverPassword);
        const result = await client.getVerbData('me', 'test');

        expect(result.reference).toBe('#131:test');
        expect(result.name).toBe('ServiceAccount:test');
        expect(result.code).toHaveSize(2);
        expect(result.code[0]).toBe('"Usage: ;#131:test();";');
        expect(result.code[1]).toBe('player:tell("test");');
    });
});