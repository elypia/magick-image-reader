import * as vscode from 'vscode';
import { DocumentNode } from "../layer-view/document-node";

/**
 * Stores the context for a MagickDocument.
 * This ensures all relevent information is sent to the webview
 * at once to give it context on the image it's about to render.
 * 
 * @since 0.2.0
 */
export class MagickDocumentContext {

  public documentUri: vscode.Uri;

  /** The raw data that represents the document. */
  public documentData: Uint8Array;

  /** The height of the document. */
  public height: number;

  /** The width of the document. */
  public width: number;

  public constructor(
    documentUri: vscode.Uri, 
    documentData: Uint8Array, 
    height: number, 
    width: number
  ) {
    this.documentUri = documentUri;
    this.documentData = documentData;
    this.height = height;
    this.width = width;
  }

  public toString(): string {
    return `${this.documentUri} ${this.height}x${this.width} ${this.documentData.length} bytes`;
  }
}
