/*
 * Copyright 2020-2020 Elypia CIC and Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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