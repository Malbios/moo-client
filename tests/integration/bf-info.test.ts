import { fail } from 'assert';
import { expect } from 'chai';
import { suite, test } from 'mocha';
import { isErrorStateData } from '../../src/telnet/interfaces';
import { getDefaultMooClient } from '../test-utils/common';

suite('MooClient integration tests for bf info', function () {
	this.timeout(12000); // for real testing
	//this.timeout(60000); // for debugging

	test('should return info for all built-in functions', async () => {
		const client = getDefaultMooClient();

		const connectResult = await client.connect();
		expect(connectResult).to.be.null;

		const result = await client.getBuiltinFunctionsDocumentation();

		const disconnectResult = await client.disconnect();
		expect(disconnectResult).to.be.null;

		if (isErrorStateData(result)) {
			fail('result is error');
		}

		expect(result).to.have.length(129);
	});
});