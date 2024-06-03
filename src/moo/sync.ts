import fs from 'fs';
import yaml from 'yaml';
import { ErrorStateData, MultilineResult } from '../telnet/interfaces';
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

	for (const objectInfo of objectInfos) {
		fs.mkdirSync(`${rootPath}/${objectInfo.id}`);

		fs.writeFileSync(`${rootPath}/${objectInfo.id}/object.meta`, yaml.stringify(objectInfo.metadata));

		for (const verbCode of objectInfo.verbCode) {
			fs.writeFileSync(`${rootPath}/${objectInfo.id}/${verbCode.index}.moo`, verbCode.lines.join('\r\n'));
		}
	}
}