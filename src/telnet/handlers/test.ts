import { ConnectionState, ConnectionStateChanger, ErrorCode, DataHandler as IDataHandler } from '../interfaces';

enum TestState {
	undefined,
	connected,
}

export class TestDataHandler implements IDataHandler {
	private _connectedRegEx = new RegExp(/\*\*\* Connected \*\*\*/m);

	private _stateChanger: ConnectionStateChanger;

	private _buffer = '';
	private _state = TestState.undefined;

	public constructor(stateChanger: ConnectionStateChanger) {
		this._stateChanger = stateChanger;
	}

	public handle(data: string) {
		const sanitizedData = data.replaceAll('\r\n', '');

		switch (this._state) {
			case TestState.undefined: {
				this.handleConnected(sanitizedData);
				break;
			}

			case TestState.connected: {
				this.handleEvalResult(data);
				break;
			}

			default: {
				this._stateChanger.changeState(ConnectionState.error, { code: ErrorCode.generic, message: 'unexpected test state' });
				break;
			}
		}
	}

	private handleConnected(data: string) {
		const match = this._connectedRegEx.exec(data);
		if (!match) {
			return;
		}

		this._state = TestState.connected;
		this._stateChanger.changeState(ConnectionState.connected);
	}

	private handleEvalResult(data: string) {
		if (!data.endsWith('=> 0\r\n')) {
			this._buffer += data;
			return;
		}

		const fullData = this._buffer + data;
		this._buffer = '';

		const lines = fullData.split('\r\n');

		const multilineResultData = { reference: '', name: '', type: '', lines: lines.slice(0, lines.length - 2) };

		this._stateChanger.changeState(ConnectionState.multilineResult, multilineResultData);
	}
}