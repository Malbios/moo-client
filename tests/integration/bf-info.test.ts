import { fail } from 'assert';
import { expect } from 'chai';
import { suite, test } from 'mocha';
import { getDefaultMooClient } from '../test-utils/common';

suite('MooClient integration tests for bf info', function () {
	this.timeout(15000);

	test('should return info for all built-in functions', async () => {
		const client = getDefaultMooClient();

		await client.connect();

		const result = await client.getBuiltinFunctionsData();

		client.disconnect();

		if (result instanceof Error) {
			fail();
		}

		expect(result).to.have.length(129);
	});
});