import { expect } from 'chai';
import { suite, test } from 'mocha';
import fs from 'node:fs/promises';
import { getMinimalMooClient } from '../test-utils/common';

const testWorkspacePath = './tests/test-workspace';

suite('MooClient integration tests for code sync', function () {
	//this.timeout('10s'); // for real testing
	this.timeout('10m'); // for debugging

	test('init should create expected environment', async () => {
		for (const element in (await fs.readdir(testWorkspacePath))) {
			await fs.rm(`${testWorkspacePath}/#${element}`, { recursive: true, force: true });
		}

		const client = getMinimalMooClient();
		client.disableMcp();

		const connectResult = await client.connect();
		expect(connectResult).to.be.null;

		await client.initSync(testWorkspacePath);

		const disconnectResult = await client.disconnect();
		expect(disconnectResult).to.be.null;

		console.log('');
	});
});