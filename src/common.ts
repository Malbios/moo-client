export function getAllMatches(regex: RegExp, data: string): RegExpExecArray[] {
	const matches: RegExpExecArray[] = [];

	let match;
	while ((match = regex.exec(data)) !== null) {
		matches.push(match);
	}

	return matches;
}