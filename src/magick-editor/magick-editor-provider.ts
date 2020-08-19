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
import { MagickDocument } from './magick-document';
import { WebviewCollection } from '../utils/webview-collection';
import { Interpolator } from '../utils/interpolator';
import { Nonce } from '../utils/nonce';
import { MagickEdit } from './magick-edit';
import { Disposable } from '../utils/disposable';
import { WebviewEvent } from './webview-event';
import { WebviewEventType } from './webview-event-type';

/**
 * The actual editor for ImageMagick types.
 * This is used by all images loaded via ImageMagick to display
 * a web friendly version of it.
 * 
 * @since 1.0.0
 */
export class MagickEditorProvider implements vscode.CustomReadonlyEditorProvider {

  /** Tracks all known webviews. */
  private readonly webviews: WebviewCollection;

  /** All callbacks that are pending from the view. */
  private readonly callbacks: Map<number, (response: any) => void>;

  /** 
   * After we request the static webview HTML the first time, we store the result
   * so we don't have to query it again as this won't change within the same session.
   */
  private staticWebviewHtml: Thenable<string> | undefined;

  private request: number;

  constructor(private readonly _context: vscode.ExtensionContext) {
    console.log('Initialized instance of MagickEditorProvider.');

    this.webviews = new WebviewCollection();
    this.callbacks = new Map<number, (response: any) => void>();
    this.request = 0;
  }

  public async openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    cancellationToken: vscode.CancellationToken
  ): Promise<MagickDocument> {
    console.log('MagickEditor is preparing to open file at:', uri.toString());

    const document: MagickDocument = await MagickDocument.create(uri, openContext.backupId, {
      getFileData: async () => {
        const webviewsForDocument = Array.from(this.webviews.get(document.uri));

        if (!webviewsForDocument.length)
          throw new Error('Could not find webview to save for.');

        const panel = webviewsForDocument[0];
        const response = await this.postMessageWithResponse<number[]>(panel, 'getFileData', {});
        console.log('Send panel, and received response with content:', response);
        return new Uint8Array(response);
      }
    });

    const listeners: vscode.Disposable[] = [];

    listeners.push(document.onDidChange(e => {
      this._onDidChangeCustomDocument.fire({ document, ...e });
    }));

    listeners.push(document.onDidChangeContent(e => {
      for (const webviewPanel of this.webviews.get(document.uri)) {
        this.postMessage(webviewPanel, WebviewEventType.Update, {
          edits: e.edits,
          content: e.content,
        });
      }
    }));

    document.onDidDispose(() => Disposable.disposeAll(listeners));

    return document;
  }

  public async resolveCustomEditor(
    document: MagickDocument,
    webviewPanel: vscode.WebviewPanel,
    cancellationToken: vscode.CancellationToken
  ): Promise<void> {
    this.webviews.add(document.uri, webviewPanel);

    webviewPanel.webview.options = {
      enableScripts: true
    };

    webviewPanel.webview.html = await this.getWebviewHtml(webviewPanel.webview);
    console.log('Rendering HTML for document with URI:', document.toString());

    webviewPanel.webview.onDidReceiveMessage((event: WebviewEvent) => {
      const type: WebviewEventType = event.type;      

      switch (type) {
        case WebviewEventType.Ready:
          this.postMessage(webviewPanel, WebviewEventType.Init, document.documentData);

          break;
        case WebviewEventType.Response:
          const value: any = event.value;
          const callback = this.callbacks.get(value.requestId);
          callback?.(value.body);
          break;
        default:
          throw new Error('Received unknown event from webview: ' + event.type);
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

  private postMessageWithResponse<R = unknown>(panel: vscode.WebviewPanel, type: string, body: any): Promise<R> {
    const requestId = ++this.request;
    const p = new Promise<R>(resolve => this.callbacks.set(requestId, resolve));
    panel.webview.postMessage({ type, requestId, body });
    return p;
  }

  /**
   * @param panel The panel to post the event to.
   * @param type The type of event that is being sent.
   * @param value The value to send to the webview.
   */
  private postMessage(panel: vscode.WebviewPanel, type: WebviewEventType, value?: any): void {
    const event: WebviewEvent = {
      type: type,
      value: value
    }

    panel.webview.postMessage(event);
  }

  /**
	 * Get the static HTML used for in our editor's webviews.
   * 
   * @param webview
   * @returns The HTML content to represents the desired webview.
	 */
  private async getWebviewHtml(webview: vscode.Webview): Promise<string> {
    const wwwPath: vscode.Uri = vscode.Uri.joinPath(this._context.extensionUri, 'media', 'www');
    const scriptPath: vscode.Uri = webview.asWebviewUri(vscode.Uri.joinPath(wwwPath, 'main.js'));
    const stylePath: vscode.Uri = webview.asWebviewUri(vscode.Uri.joinPath(wwwPath, 'style.css'));

    const staticHtmlTemplate: string = await this.getStaticWebviewHtml(webview, wwwPath);

    const variables: Map<string, string> = new Map<string, string>()
      .set('nonce', Nonce.generate())
      .set('scriptPath', scriptPath.toString())
      .set('stylePath', stylePath.toString());

    const interpolator: Interpolator = new Interpolator(variables);
    const html = interpolator.interpolate(staticHtmlTemplate);
    return html;
  }

  /**
   * To avoid performing certain operation multiple times, the static parts
   * that can be collected here and only run once per session and in this method.
   * The actual getWebviewHtml method contains the dynamic parts which may change
   * the HTML content per function call.
   * 
   * @returns The webview HTML that statically remains the same
   * between all webviews in the session.
   */
  private async getStaticWebviewHtml(webview: vscode.Webview, wwwPath: vscode.Uri): Promise<string> {
    if (this.staticWebviewHtml)
      return this.staticWebviewHtml;

    const editorPath: vscode.Uri = vscode.Uri.joinPath(wwwPath, 'index.html');

    const variables: Map<string, string> = new Map<string, string>()
      .set('cspSource', webview.cspSource);

    const staticHtml = vscode.workspace.fs.readFile(editorPath)
      .then((array: Uint8Array) => {
        const interpolator: Interpolator = new Interpolator(variables);
        const template = array.toString();
        const staticHtml = interpolator.interpolate(template);

        return staticHtml;
      });

    return this.staticWebviewHtml = staticHtml;
  }
}
