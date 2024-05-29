import { MooClient } from '../../src';
import { getServerCredentials } from './secrets';

export function getDefaultMooClient(): MooClient {
	const credentials = getServerCredentials();

	return MooClient.create(credentials.serverAddress, credentials.serverPort, credentials.serverUsername, credentials.serverPassword);
}