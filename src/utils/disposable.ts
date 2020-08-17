import * as vscode from 'vscode';

export function disposeAll(disposables: vscode.Disposable[]): void {
  for (let i = disposables.length; i >= 0; i--)
    disposables[i].dispose();  
}

/**
 * @since 1.0.0
 */
export abstract class Disposable {
  
	private _isDisposed = false;
	protected disposables: vscode.Disposable[];

  public constructor() {
    this.disposables = [];
  }

	public dispose(): void {
		if (this._isDisposed)
			return;

    this._isDisposed = true;
		disposeAll(this.disposables);
	}

	protected register<T extends vscode.Disposable>(value: T): T {
    (this._isDisposed) ? value.dispose() : this.disposables.push(value);
    return value;
	}

	protected get isDisposed(): boolean {
		return this._isDisposed;
	}
}