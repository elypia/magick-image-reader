import * as vscode from 'vscode';
import { MagickEdit, MagickDocument } from './magick-document';
import { disposeAll } from '../utils/disposable';
import * as path from 'path';
import { WebviewCollection } from '../utils/webview-collection';
import { ImageMagick } from '@imagemagick/magick-wasm';
import { getNonce } from '../utils/nonce';

/**
 * The actual editor for ImageMagick types.
 * This is used by all images loaded via ImageMagick to display
 * a web friendly version of it.
 * 
 * @since 1.0.0
 */
export class MagickEditorProvider implements vscode.CustomReadonlyEditorProvider {

  /** Tracks all known webviews. */
  private readonly webviews = new WebviewCollection();

  constructor(private readonly _context: vscode.ExtensionContext) {
    console.log('Initialized instance of MagickEditorProvider.');
  }

  public async openCustomDocument(
    uri: vscode.Uri,
    openContext: { backupId?: string },
    _token: vscode.CancellationToken
  ): Promise<MagickDocument> {
    console.log('MagickEditor is preparing to open file at:', uri.toString());

    const document: MagickDocument = await MagickDocument.create(uri, openContext.backupId, {
      getFileData: async () => {
        const webviewsForDocument = Array.from(this.webviews.get(document.uri));

        if (!webviewsForDocument.length)
          throw new Error('Could not find webview to save for.');

        const panel = webviewsForDocument[0];
        const response = await this.postMessageWithResponse<number[]>(panel, 'getFileData', {});
        return new Uint8Array(response);
      }
    });

    const listeners: vscode.Disposable[] = [];

    listeners.push(document.onDidChange(e => {
      this._onDidChangeCustomDocument.fire({ document, ...e });
    }));

    listeners.push(document.onDidChangeContent(e => {
      for (const webviewPanel of this.webviews.get(document.uri)) {
        this.postMessage(webviewPanel, 'update', {
          edits: e.edits,
          content: e.content,
        });
      }
    }));

    document.onDidDispose(() => disposeAll(listeners));

    return document;
  }

  async resolveCustomEditor(
    document: MagickDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Add the webview to our internal set of active webviews
    this.webviews.add(document.uri, webviewPanel);

    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    const templateHtml = this.getHtmlForWebview(webviewPanel.webview);
    webviewPanel.webview.html = templateHtml.toString();

    console.log('Rendering HTML for document with URI:', document.toString());

    webviewPanel.webview.onDidReceiveMessage(e => this.onMessage(document, e));

    // Wait for the webview to be properly ready before we init
    webviewPanel.webview.onDidReceiveMessage(e => {
      if (e.type === 'ready') {
        if (document.uri.scheme === 'untitled') {
          this.postMessage(webviewPanel, 'init', {
            untitled: true
          });
        } else {
          this.postMessage(webviewPanel, 'init', {
            value: document.documentData
          });
        }
      }
    });
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<MagickDocument>>();
  public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  public saveCustomDocument(document: MagickDocument, cancellation: vscode.CancellationToken): Thenable<void> {
    return document.save(cancellation);
  }

  public saveCustomDocumentAs(document: MagickDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
    return document.saveAs(destination, cancellation);
  }

  public revertCustomDocument(document: MagickDocument, cancellation: vscode.CancellationToken): Thenable<void> {
    return document.revert(cancellation);
  }

  public backupCustomDocument(document: MagickDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
    return document.backup(context.destination, cancellation);
  }

  //#endregion

	/**
	 * Get the static HTML used for in our editor's webviews.
	 */
  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(
      path.join(this._context.extensionPath, 'media', 'main.js')
    ));

    const nonce = getNonce();
    return `
    	<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Magick Image Reader</title>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</head>
			<body>
				<div class="drawing-canvas"></div>
			</body>
			</html>`;
  }

  private _requestId = 1;
  private readonly _callbacks = new Map<number, (response: any) => void>();

  private postMessageWithResponse<R = unknown>(panel: vscode.WebviewPanel, type: string, body: any): Promise<R> {
    const requestId = this._requestId++;
    const p = new Promise<R>(resolve => this._callbacks.set(requestId, resolve));
    panel.webview.postMessage({ type, requestId, body });
    return p;
  }

  private postMessage(panel: vscode.WebviewPanel, type: string, body: any): void {
    panel.webview.postMessage({ type, body });
  }

  private onMessage(document: MagickDocument, message: any) {
    switch (message.type) {
      case 'stroke':
        document.makeEdit(message as MagickEdit);
        return;

      case 'response':
        {
          const callback = this._callbacks.get(message.requestId);
          callback?.(message.body);
          return;
        }
    }
  }

}