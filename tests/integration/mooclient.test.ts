import { suite, test } from 'mocha';
import { getDefaultMooClient } from '../test-utils/common';

suite('MooClient integration tests', () => {
	test('should be created with no errors', () => {
		getDefaultMooClient();
	});
});