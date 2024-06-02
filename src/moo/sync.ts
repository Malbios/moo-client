import fs from 'fs';
import { ErrorStateData, MultilineResult, isErrorStateData } from '../telnet/interfaces';
import { getAllObjects } from './parsing';

export async function init(rootPath: string, evalAction: (x: string) => Promise<MultilineResult | ErrorStateData>) {
	if (!fs.existsSync(rootPath)) {
		throw Error(`rootPath '${rootPath}' does not exist`);
	}

	const existingElements = fs.readdirSync(rootPath, { recursive: true });
	if (existingElements.length > 0) {
		throw Error('rootPath isn\'t empty');
	}

	const objectInfos = await getAllObjects(evalAction);
	if (isErrorStateData(objectInfos)) {
		throw Error('could not get object infos');
	}

	for (const objectInfo of objectInfos) {
		fs.mkdirSync(`${rootPath}/${objectInfo.id}`);

		for (const verbInfo of objectInfo.verbs) {
			fs.writeFileSync(`${rootPath}/${objectInfo.id}/${verbInfo.name}.moo`, verbInfo.code.join('\r\n'));
		}
	}
}