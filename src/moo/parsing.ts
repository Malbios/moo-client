import { getAllMatches } from '../common';
import { ErrorStateData, MultilineResult, isErrorStateData } from '../telnet/interfaces';

interface ObjectInfo {
	id: string;
	metadata: ObjectMetadata;
	verbCode: VerbCode[];
}

interface ObjectMetadata {
	name: string;
	flags: ObjectFlags;
	location: string;
	contents: string[];
	properties: PropertyData[];
	verbs: VerbData[];
}

interface ObjectFlags {
	player: boolean;
	programmer: boolean;
	wizard: boolean;
	r: boolean;
	w: boolean;
	f: boolean;
}

interface PropertyData {
	name: string;
	owner: string;
	permissions: string;
	value: string;
}

interface VerbData {
	index: number;
	names: string[];
	owner: string;
	permissions: string;
	arguments: VerbArguments;
}

interface VerbArguments {
	direct_object: string;
	preposition: string;
	indirect_object: string;
}

interface VerbCode {
	index: number;
	lines: string[];
}

class Helper {
	private _outerRegEx = new RegExp(/(\#\d+)\, \{([^\}]*)\}\, \{([^\}]*)\}/);
	private _stringListRegEx = new RegExp(/"([^"]+)"/, 'g');
	private _evalAction: (x: string) => Promise<MultilineResult | ErrorStateData>;

	public constructor(evalAction: (x: string) => Promise<MultilineResult | ErrorStateData>) {
		this._evalAction = evalAction;
	}

	public async getObjectInfos(): Promise<ObjectInfo[]> {
		const outerResult = await this.eval('for o in [#0..max_object()] if (valid(o)) notify(me, tostr(o) + ", " + toliteral(properties(o)) + ", " + toliteral(verbs(o))); endif endfor');

		const objectInfos: ObjectInfo[] = [];

		for (const line of outerResult.lines) {
			const objectInfo = await this.getObjectInfo(line);

			if (objectInfo) {
				objectInfos.push(objectInfo);
			}
		}

		return objectInfos;
	}

	private async getObjectInfo(data: string): Promise<ObjectInfo | undefined> {
		const match = this._outerRegEx.exec(data);
		if (!match) {
			return;
		}

		const objectId = match[1];

		const propertyNamesMatches = getAllMatches(this._stringListRegEx, match[2]);
		const verbNamesMatches = getAllMatches(this._stringListRegEx, match[3]);

		const properties: PropertyData[] = [];

		for (const propertyMatch of propertyNamesMatches) {
			properties.push(await this.getPropertyInfo(objectId, propertyMatch[1]));
		}

		const verbData: VerbData[] = [];

		for (let i = 1; i <= verbNamesMatches.length; i++) {
			const result = await this.getVerbData(objectId, i);
			verbData.push(result);
		}

		const verbCode: VerbCode[] = [];

		for (let i = 1; i <= verbNamesMatches.length; i++) {
			const result = await this.getVerbCode(objectId, i);
			verbCode.push(result);
		}

		const result = await this.eval(`obj = ${objectId}; notify(me, obj.name); notify(me, tostr(obj.location)); notify(me, toliteral(obj.contents)); notify(me, tostr(is_player(obj))); notify(me, tostr(obj.programmer)); notify(me, tostr(obj.wizard)); notify(me, tostr(obj.r)); notify(me, tostr(obj.w)); notify(me, tostr(obj.f));`);

		const contents = getAllMatches(this._stringListRegEx, result.lines[2]).map(x => x[1]);
		const isPlayer = result.lines[3] == '1' ? true : false;
		const isProgrammer = result.lines[4] == '1' ? true : false;
		const isWizard = result.lines[5] == '1' ? true : false;
		const isReadable = result.lines[6] == '1' ? true : false;
		const isWriteable = result.lines[7] == '1' ? true : false;
		const isFertile = result.lines[8] == '1' ? true : false;

		const flags = { player: isPlayer, programmer: isProgrammer, wizard: isWizard, r: isReadable, w: isWriteable, f: isFertile };

		const metadata = { name: result.lines[0], flags: flags, location: result.lines[1], contents: contents, properties: properties, verbs: verbData };

		return { id: objectId, metadata: metadata, verbCode: verbCode };
	}

	private async getPropertyInfo(objectId: string, name: string): Promise<PropertyData> {
		const propertyInfo: PropertyData = { name: name, owner: '', permissions: '', value: '' };

		const result = await this.eval(`name = "${name}"; obj = ${objectId}; x = property_info(obj, name); notify(me, tostr(x[1])); notify(me, x[2]); notify(me, toliteral(obj.(name)));`);

		propertyInfo.owner = result.lines[0];
		propertyInfo.permissions = result.lines[1];
		propertyInfo.value = result.lines[2];

		return propertyInfo;
	}

	private async getVerbData(objectId: string, index: number): Promise<VerbData> {
		const verb_arguments: VerbArguments = { direct_object: '', preposition: '', indirect_object: '' };
		const verbInfo: VerbData = { index: index, names: [], owner: '', permissions: '', arguments: verb_arguments };

		const infoResult = await this.eval(`x = verb_info(${objectId}, ${index}); y = verb_args(${objectId}, ${index}); notify(me, tostr(x[1])); notify(me, tostr(x[2])); notify(me, toliteral(x[3])); notify(me, toliteral(y));`);

		verbInfo.owner = infoResult.lines[0];
		verbInfo.permissions = infoResult.lines[1];

		const nameMatches = getAllMatches(this._stringListRegEx, infoResult.lines[2]);
		verbInfo.names = nameMatches.map(x => x[1]);

		const argMatches = getAllMatches(this._stringListRegEx, infoResult.lines[3]);
		verb_arguments.direct_object = argMatches[0][1];
		verb_arguments.preposition = argMatches[1][1];
		verb_arguments.indirect_object = argMatches[2][1];

		return verbInfo;
	}

	private async getVerbCode(objectId: string, index: number): Promise<VerbCode> {
		const result = await this.eval(`for line in (verb_code(${objectId}, ${index})) notify(me, line); endfor`);

		return { index: index, lines: result.lines };
	}

	private async eval(input: string): Promise<MultilineResult> {
		const result = await this._evalAction(input);
		if (isErrorStateData(result)) {
			throw Error(result.message);
		}

		return result;
	}
}

export async function getAllObjects(evalAction: (x: string) => Promise<MultilineResult | ErrorStateData>): Promise<ObjectInfo[]> {
	const helper = new Helper(evalAction);
	return helper.getObjectInfos();
}