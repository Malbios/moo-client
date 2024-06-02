import { MooClient } from '../../src';
import { getMinimalCredentials, getServerCredentials } from './secrets';

export function getDefaultMooClient(): MooClient {
	const credentials = getServerCredentials();

	return MooClient.create(credentials.address, credentials.port, credentials.username, credentials.password);
}

export function getMinimalMooClient(): MooClient {
	const credentials = getMinimalCredentials();

	return MooClient.create(credentials.address, credentials.port, credentials.username, credentials.password);
}