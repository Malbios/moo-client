import { ConnectionState, ConnectionStateChanger, ErrorCode, DataHandler as IDataHandler } from '../interfaces';

export class ErrorHandler implements IDataHandler {
	private _stateChanger: ConnectionStateChanger;

	public constructor(stateChanger: ConnectionStateChanger) {
		this._stateChanger = stateChanger;
	}

	public handle(data: string) {
		const sanitizedData = data.replaceAll('\r\n', '');

		this.handleMcpEvalError(sanitizedData);
		this.handleSyntaxError(sanitizedData);
	}

	private handleMcpEvalError(data: string) {
		const match = data.match(/ERROR: ([^\s]+) (.*)/);
		if (!match) {
			return;
		}

		let errorCode = ErrorCode.mcpEvalFailed;

		if (match[1] === 'E_VARNF') {
			errorCode = ErrorCode.varNotFound;
		} else if (match[1] === 'E_VERBNF') {
			errorCode = ErrorCode.verbNotFound;
		}

		this._stateChanger.changeState(ConnectionState.error,
			{ code: errorCode, message: match[2] });
	}

	private handleSyntaxError(data: string) {
		const match = data.match(/Line 1:  syntax error/);
		if (!match) {
			return;
		}

		this._stateChanger.changeState(ConnectionState.error,
			{ code: ErrorCode.syntaxError, message: match[0] });
	}
}