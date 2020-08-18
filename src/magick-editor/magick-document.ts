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
import { ImageMagick } from '@imagemagick/magick-wasm';
import { MagickDocumentDelegate } from './magick-document-delegate';
import { MagickEdit } from './magick-edit';
import { Disposable } from '../utils/disposable';
import { MagickImage } from '@imagemagick/magick-wasm/magick-image';

/**
 * @since 1.0.0
 */
export class MagickDocument extends Disposable implements vscode.CustomDocument {

  public static async create(
    uri: vscode.Uri,
    backupId: string | undefined,
    delegate: MagickDocumentDelegate
  ): Promise<MagickDocument | PromiseLike<MagickDocument>> {
    const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;
    const fileData = await MagickDocument.readFile(dataFile);
    return new MagickDocument(uri, fileData, delegate);
  }

	private static async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		if (uri.scheme === 'untitled')
			throw new Error('Can\'t create new file with this editor.');

		return await vscode.workspace.fs.readFile(uri).then(async (fileData: Uint8Array) => {
			console.log('Loaded document of length:', fileData.length);

			if (uri.path.toLowerCase().endsWith('.png')) {
				console.log('Image was a PNG already, so returning it as is.');
				return fileData;
			}

			try {
				ImageMagick.read(fileData, async (image: MagickImage) => {
					console.debug('Succesfully read document:', image.toString());
					let convertedBytes: Uint8Array | undefined = undefined;

					image.write((bytesToWrite) => {
						console.log('Converted document to PNG for previewing.');
						convertedBytes = bytesToWrite;
					});
					
					return convertedBytes;
				});

				return new Uint8Array();
			} catch (err) {
				console.error('Failed to load document or convert to a viewable format.\n', err);
				throw new Error('Unable to convert document to a viewable format.');
			}
		});
	}

  private readonly _uri: vscode.Uri;

  private _documentData: Uint8Array;
  private _edits: Array<MagickEdit> = [];
  private _savedEdits: Array<MagickEdit> = [];

  private readonly _delegate: MagickDocumentDelegate;

  private constructor(
    uri: vscode.Uri,
    initialContent: Uint8Array,
    delegate: MagickDocumentDelegate
  ) {
    super();
    this._uri = uri;
    this._documentData = initialContent;
    this._delegate = delegate;
  }

  public get uri() { return this._uri; }

  public get documentData(): Uint8Array { return this._documentData; }

  private readonly _onDidDispose = this.register(new vscode.EventEmitter<void>());
	/**
	 * Fired when the document is disposed of.
	 */
  public readonly onDidDispose = this._onDidDispose.event;

  private readonly _onDidChangeDocument = this.register(new vscode.EventEmitter<{
    readonly content?: Uint8Array;
    readonly edits: readonly MagickEdit[];
  }>());
	/**
	 * Fired to notify webviews that the document has changed.
	 */
  public readonly onDidChangeContent = this._onDidChangeDocument.event;

  private readonly _onDidChange = this.register(new vscode.EventEmitter<{
    readonly label: string,
    undo(): void,
    redo(): void,
  }>());
	/**
	 * Fired to tell VS Code that an edit has occured in the document.
	 * 
	 * This updates the document's dirty indicator.
	 */
  public readonly onDidChange = this._onDidChange.event;

	/**
	 * Called by VS Code when there are no more references to the document.
	 * 
	 * This happens when all editors for it have been closed.
	 */
  dispose(): void {
    this._onDidDispose.fire();
    super.dispose();
  }

	/**
	 * Called when the user edits the document in a webview.
	 * 
	 * This fires an event to notify VS Code that the document has been edited.
	 */
  makeEdit(edit: MagickEdit) {
    this._edits.push(edit);

    this._onDidChange.fire({
      label: 'Stroke',
      undo: async () => {
        this._edits.pop();
        this._onDidChangeDocument.fire({
          edits: this._edits,
        });
      },
      redo: async () => {
        this._edits.push(edit);
        this._onDidChangeDocument.fire({
          edits: this._edits,
        });
      }
    });
  }

	/**
	 * Called by VS Code when the user saves the document.
	 */
  async save(cancellation: vscode.CancellationToken): Promise<void> {
    await this.saveAs(this.uri, cancellation);
    this._savedEdits = Array.from(this._edits);
  }

	/**
	 * Called by VS Code when the user saves the document to a new location.
	 */
  async saveAs(targetResource: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
    const fileData = await this._delegate.getFileData();
    if (cancellation.isCancellationRequested) {
      return;
    }
    await vscode.workspace.fs.writeFile(targetResource, fileData);
  }

	/**
	 * Called by VS Code when the user calls `revert` on a document.
	 */
  async revert(_cancellation: vscode.CancellationToken): Promise<void> {
    const diskContent = await MagickDocument.readFile(this.uri);
    this._documentData = diskContent;
    this._edits = this._savedEdits;
    this._onDidChangeDocument.fire({
      content: diskContent,
      edits: this._edits,
    });
  }

	/**
	 * Called by VS Code to backup the edited document.
	 */
  public async backup(
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    await this.saveAs(destination, cancellation);

    const backup: vscode.CustomDocumentBackup = {
      id: destination.toString(),
      delete: async () => {
        try {
          await vscode.workspace.fs.delete(destination);
        } catch {
          // Do nothing.
        }
      }
    };

    return backup;
  }

  public toString(): string {
    return this.uri.toString();
  }
}