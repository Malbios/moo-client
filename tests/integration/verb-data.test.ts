import { expect } from 'chai';
import { suite, test } from 'mocha';
import { VerbData } from '../../src/interfaces';
import { getDefaultMooClient } from '../test-utils/common';

suite('MooClient integration tests for verb data', function () {
    this.timeout(5000);

    test('should return error for invalid object in verb info', async () => {
        const client = getDefaultMooClient();

        await client.connect();

        const result = await client.getVerbData('DoesNotExist', 'test');

        client.disconnect();

        const error = result as Error;

        expect(error.message).to.contain('I see no "DoesNotExist" here');
    });

    test('should throw expected error for invalid verb in verb info', async () => {
        this.timeout(5000);

        const client = getDefaultMooClient();

        await client.connect();

        const result = await client.getVerbData('me', 'DefinitelyDoesNotExist');

        client.disconnect();

        const error = result as Error;

        expect(error.message).to.contain('That object does not define that verb');
    });

    test('should return expected verb data for given verb info', async () => {
        this.timeout(5000);

        const client = getDefaultMooClient();

        await client.connect();

        const result = await client.getVerbData('me', 'test');

        client.disconnect();

        const verbData = result as VerbData;

        expect(verbData.reference).to.equal('#129:test');
        expect(verbData.name).to.equal('ServiceAccount:test');
        expect(verbData.code).to.have.length(2);
        expect(verbData.code[0]).to.equal('"Usage: test()";');
        expect(verbData.code[1]).to.equal('player:tell("test");');
    });

    test('should return expected verb data for multiple verb data requests', async () => {
        this.timeout(5000);

        const client = getDefaultMooClient();

        await client.connect();

        const resultA = await client.getVerbData('me', 'test1');
        const resultB = await client.getVerbData('me', 'test2');

        client.disconnect();

        const verbDataA = resultA as VerbData;

        expect(verbDataA.reference).to.equal('#129:test1');
        expect(verbDataA.name).to.equal('ServiceAccount:test1');
        expect(verbDataA.code).to.have.length(2);
        expect(verbDataA.code[0]).to.equal('player:tell(1);');
        expect(verbDataA.code[1]).to.equal('player:tell(2);');

        const verbDataB = resultB as VerbData;

        expect(verbDataB.reference).to.equal('#129:test2');
        expect(verbDataB.name).to.equal('ServiceAccount:test2');
        expect(verbDataB.code).to.have.length(2);
        expect(verbDataB.code[0]).to.equal('player:tell(3);');
        expect(verbDataB.code[1]).to.equal('player:tell(4);');
    });
});