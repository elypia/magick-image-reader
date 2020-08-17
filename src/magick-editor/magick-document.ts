import * as vscode from 'vscode';
import { Disposable } from '../utils/disposable';
import { ImageMagick } from '@imagemagick/magick-wasm';
import { MagickFormat } from '@imagemagick/magick-wasm/magick-format';
import { threadId } from 'worker_threads';
import { MagickImage } from '@imagemagick/magick-wasm/magick-image';

/**
 * Stores the edit history of a Magick document.
 * 
 * @since 1.0.0
 */
export interface MagickEdit {

}

/**
 * Called by Visual Studio Code whenever a user saved the document
 * to a new location.
 * 
 * @since 1.0.0
 */
export interface MagickDocumentDelegate {
  getFileData(): Promise<Uint8Array>;
}

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
      return new Uint8Array();

    let random: Uint8Array = new Uint8Array();

    await vscode.workspace.fs.readFile(uri).then((data) => {
      console.log('Loaded document of length:', data.length);

      try {
        ImageMagick.read(data, async (image) => {
          console.debug('Succesfully read document:', image.toString());
          random = data;
          // image.write(async (writeData) => {
          //   random = writeData;
          // }, MagickFormat.Png);
        });
      } catch (err) {
        console.error('Failed to load data as MagickImage.\n', err);
      }
    });

    console.log('Returning array of bytes of length:', random.length);
    return random;
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