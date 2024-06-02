import { expect } from 'chai';
import { suite, test } from 'mocha';
import { ErrorCode, ErrorStateData } from '../../src/telnet/interfaces';
import { getDefaultMooClient } from '../test-utils/common';

suite('MooClient integration tests for verb code', function () {
    this.timeout(5000);

    test('should return error for invalid object in verb info', async () => {
        const client = getDefaultMooClient();

        const connectResult = await client.connect();
        expect(connectResult).to.be.null;

        const result = await client.getVerbCode('DoesNotExist', 'test');

        const disconnectResult = await client.disconnect();
        expect(disconnectResult).to.be.null;

        const error = result as ErrorStateData;

        expect(error.code).to.equal(ErrorCode.varNotFound);
        expect(error.message).to.contain('Variable not found: DoesNotExist');
    });

    test('should throw expected error for invalid verb in verb info', async () => {
        const client = getDefaultMooClient();

        const connectResult = await client.connect();
        expect(connectResult).to.be.null;

        const result = await client.getVerbCode('#129', 'DefinitelyDoesNotExist');

        const disconnectResult = await client.disconnect();
        expect(disconnectResult).to.be.null;

        const error = result as ErrorStateData;

        expect(error.code).to.equal(ErrorCode.verbNotFound);
        expect(error.message).to.contain('Verb not found');
    });

    test('should return expected verb data for given verb info', async () => {
        const client = getDefaultMooClient();

        const connectResult = await client.connect();
        expect(connectResult).to.be.null;

        const result = await client.getVerbCode('#129', 'test');

        const disconnectResult = await client.disconnect();
        expect(disconnectResult).to.be.null;

        const code = result as string[];

        expect(code[0]).to.equal('"Usage: test()";');
        expect(code[1]).to.equal('player:tell("test");');
    });

    test('should return expected verb data for multiple verb data requests', async () => {
        const client = getDefaultMooClient();

        const connectResult = await client.connect();
        expect(connectResult).to.be.null;

        const resultA = await client.getVerbCode('#129', 'test1');
        const resultB = await client.getVerbCode('#129', 'test2');

        const disconnectResult = await client.disconnect();
        expect(disconnectResult).to.be.null;

        const codeA = resultA as string[];

        expect(codeA[0]).to.equal('player:tell(1);');
        expect(codeA[1]).to.equal('player:tell(2);');

        const codeB = resultB as string[];

        expect(codeB[0]).to.equal('player:tell(3);');
        expect(codeB[1]).to.equal('player:tell(4);');
    });
});