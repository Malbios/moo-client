import { getAllMatches } from '../common';
import { ErrorStateData, MultilineResult, isErrorStateData } from '../telnet/interfaces';

interface ObjectInfo {
	id: string;
	properties: PropertyInfo[];
	verbs: VerbInfo[];
}

interface PropertyInfo {
	name: string;
	value: string;
}

interface VerbInfo {
	name: string;
	code: string[];
}

export async function getAllObjects(evalAction: (x: string) => Promise<MultilineResult | ErrorStateData>): Promise<ObjectInfo[] | ErrorStateData> {
	const result = await evalAction('for o in [#0..max_object()] if (valid(o)) notify(me, tostr(o) + ": " + toliteral(verbs(o))); endif endfor');
	if (isErrorStateData(result)) {
		return result;
	}

	const outerRegex = new RegExp(/(\#\d+)\: \{(.*)\}/);
	const innerRegex = new RegExp(/"([^"]+)"/, 'g');

	const objects: ObjectInfo[] = [];

	for (const line of result.lines) {
		const match = outerRegex.exec(line);
		if (!match) {
			continue;
		}

		const object = match[1];
		const verbNamesMatches = getAllMatches(innerRegex, match[2]);

		const verbs: VerbInfo[] = [];

		for (let i = 1; i <= verbNamesMatches.length; i++) {
			const name = verbNamesMatches[i - 1][1];

			const codeLinesResult = await evalAction(`for line in (verb_code(${object}, ${i})) notify(me, line); endfor`);
			if (isErrorStateData(codeLinesResult)) {
				return codeLinesResult;
			}

			verbs.push({ name: name, code: codeLinesResult.lines });
		}

		objects.push({ id: object, properties: [], verbs: verbs });
	}

	return objects;
}