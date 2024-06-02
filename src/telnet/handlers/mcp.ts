import { getAllMatches } from '../../common';
import { ConnectionState, ConnectionStateChanger, ErrorCode, DataHandler as IDataHandler, TelnetMessageSender } from '../interfaces';

const MCP_AUTH_KEY = 1357924680;

enum McpState {
	undefined,
	negotiating,
	negotiated,
}

interface SimpleEditContent {
	id: string;
	reference: string;
	name: string;
	type: string;
	lines: string[];
}

export class McpDataHandler implements IDataHandler {
	private _mcpStartRegEx = new RegExp(/#\$#mcp version: ([\d\.]+) to: ([\d\.]+)/m);
	private _mcpNegotiateNegotiateRegEx = new RegExp(`#\\$#mcp-negotiate-can ${MCP_AUTH_KEY} package: mcp-negotiate min-version: ([\\d\\.]+) max-version: ([\\d\\.]+)`, '');
	private _mcpNegotiateCordRegEx = new RegExp(`#\\$#mcp-negotiate-can ${MCP_AUTH_KEY} package: mcp-cord min-version: ([\\d\\.]+) max-version: ([\\d\\.]+)`, '');
	private _mcpNegotiateSimpleEditRegEx = new RegExp(`#\\$#mcp-negotiate-can ${MCP_AUTH_KEY} package: dns-org-mud-moo-simpleedit min-version: ([\\d\\.]+) max-version: ([\\d\\.]+)`, '');
	private _mcpNegotiateEndRegEx = new RegExp(`#\\$#mcp-negotiate-end ${MCP_AUTH_KEY}`, '');
	private _mcpMultilineStartRegEx = new RegExp(`#\\$#dns-org-mud-moo-simpleedit-content ${MCP_AUTH_KEY} reference: ([^ ]+) name: ([^ ]+) type: ([^ ]+) content\\*: \\"\\" _data-tag: (\\d+)`, 'g');

	private _messageSender: TelnetMessageSender;
	private _stateChanger: ConnectionStateChanger;

	private _state = McpState.undefined;
	private _simpleEditContents: SimpleEditContent[] = [];

	public constructor(messageSender: TelnetMessageSender, stateChanger: ConnectionStateChanger) {
		this._messageSender = messageSender;
		this._stateChanger = stateChanger;
	}

	public handle(data: string) {
		const sanitizedData = data.replaceAll('\r\n', '');

		switch (this._state) {
			case McpState.undefined: {
				this.handleNegotiationStart(sanitizedData);
				break;
			}

			case McpState.negotiating: {
				this.negotiateNegotiate(sanitizedData);
				this.negotiateCord(sanitizedData);
				this.negotiateSimpleEdit(sanitizedData);
				this.negotiateEnd(sanitizedData);
				break;
			}

			case McpState.negotiated: {
				this.simpleEditContentStart(sanitizedData);
				this.simpleEditContentContinue(sanitizedData);
				this.simpleEditContentFinish(sanitizedData);
				break;
			}

			default: {
				this._stateChanger.changeState(ConnectionState.error, { code: ErrorCode.generic, message: 'unexpected mcp state' });
				break;
			}
		}
	}

	private sendMcp(message: string) {
		this._messageSender.send(`#$#${message}`);
	}

	private sendCan(packageName: string, minVersion: string, maxVersion: string) {
		this.sendMcp(`mcp-negotiate-can ${MCP_AUTH_KEY} package: ${packageName} min-version: ${minVersion} max-version: ${maxVersion}`);
	}

	private handleNegotiationStart(data: string) {
		const match = this._mcpStartRegEx.exec(data);
		if (!match) {
			return;
		}

		this.sendMcp(`mcp authentication-key: ${MCP_AUTH_KEY} version: ${match[1]} to: ${match[2]}`);

		this._state = McpState.negotiating;
	}

	private negotiateNegotiate(data: string) {
		const match = this._mcpNegotiateNegotiateRegEx.exec(data);
		if (!match) {
			return;
		}

		this.sendCan('mcp-negotiate', match[1], match[2]);
	}

	private negotiateCord(data: string) {
		const match = this._mcpNegotiateCordRegEx.exec(data);
		if (!match) {
			return;
		}

		this.sendCan('mcp-cord', match[1], match[2]);
	}

	private negotiateSimpleEdit(data: string) {
		const match = this._mcpNegotiateSimpleEditRegEx.exec(data);
		if (!match) {
			return;
		}

		this.sendCan('dns-org-mud-moo-simpleedit', match[1], match[2]);
	}

	private negotiateEnd(data: string) {
		const match = this._mcpNegotiateEndRegEx.exec(data);
		if (!match) {
			return;
		}

		this.sendMcp(`mcp-negotiate-end ${MCP_AUTH_KEY}`);

		this._state = McpState.negotiated;

		this._stateChanger.changeState(ConnectionState.connected);
	}

	private simpleEditContentStart(data: string) {
		const matches = getAllMatches(this._mcpMultilineStartRegEx, data);
		for (const match of matches) {
			const multilineData = { id: match[4], reference: match[1], name: match[2], type: match[3], lines: [] };

			const existingIndex = this._simpleEditContents.findIndex(x => x.id === multilineData.id);
			if (existingIndex > -1) {
				this._simpleEditContents.splice(existingIndex, 1);
				this._stateChanger.changeState(ConnectionState.error, { code: ErrorCode.generic, message: 'unexpected mcp multiline state (new start for existing id)' });
				return;
			}

			this._simpleEditContents.push(multilineData);
		}
	}

	private simpleEditContentContinue(data: string) {
		for (const content of this._simpleEditContents) {
			const continueRegEx = new RegExp(`#\\$#\\* ${content.id} content: (.*?)(?=(#\\$#)|$)`, 'g');
			const matches = getAllMatches(continueRegEx, data);
			if (matches.length < 1) {
				continue;
			}

			for (const match of matches) {
				content.lines.push(match[1]);
			}
		}
	}

	private simpleEditContentFinish(data: string) {
		for (const content of this._simpleEditContents) {
			const finishRegEx = new RegExp(`#\\$#: ${content.id}`);
			const match = finishRegEx.exec(data);
			if (!match) {
				continue;
			}

			const contentIndex = this._simpleEditContents.findIndex(x => x.id === content.id);
			this._simpleEditContents.splice(contentIndex, 1);

			this._stateChanger.changeState(ConnectionState.multilineResult, { reference: content.reference, name: content.name, type: content.type, lines: content.lines });
		}
	}
}