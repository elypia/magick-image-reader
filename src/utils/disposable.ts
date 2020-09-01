/*
 * Copyright 2020-2020 Elypia CIC and Contributors (https://gitlab.com/Elypia/magick-image-reader/-/graphs/master)
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

/**
 * Abstracts the internal Visual Studio Code Disposable class.
 *
 * @since 0.1.0
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
		Disposable.disposeAll(this.disposables);
	}

	protected register<T extends vscode.Disposable>(value: T): T {
    (this._isDisposed) ? value.dispose() : this.disposables.push(value);
    return value;
	}

	protected get isDisposed(): boolean {
		return this._isDisposed;
	}

	/**
	 * Pops all items out of the array and calls dispose on all of them.
	 *
	 * @param disposables An array of disposable objects.
	 */
	public static disposeAll(disposables: vscode.Disposable[]): void {
		while (disposables.length) {
			const disposable = disposables.pop();

			if (disposable)
				disposable.dispose();
		}
	}
}
