import * as vscode from 'vscode';
import { MagickImage } from '@imagemagick/magick-wasm/magick-image';
import { MimeType } from '../utils/imagemagick/mime-type';

/**
 * Stores the context for a MagickDocument.
 * This ensures all relevent information is sent to the webview
 * at once to give it context on the image it's about to render.
 * 
 * @since 0.2.0
 */
export class MagickDocumentContext {

  /** The Visual Studio Code URI of the original resource. */
  public documentUri: vscode.Uri;

  /** If the data represents the URI, or has been modified in memory. */
  public modified: boolean;

  /** The raw data that represents the viewable document. */
  public documentData: Uint8Array;

  /** The MIME type of the data, this may not be the same as the original document. */
  public mimeType: MimeType;

  /** The height of the document. */
  public height: number;

  /** The width of the document. */
  public width: number;

  public constructor(
    documentUri: vscode.Uri, 
    modified: boolean,
    documentData: Uint8Array,
    mimeType: MimeType, 
    height: number, 
    width: number
  ) {
    this.documentUri = documentUri;
    this.modified = modified;
    this.documentData = documentData;
    this.mimeType = mimeType;
    this.height = height;
    this.width = width;
  }

  public toString(): string {
    return `${this.documentUri} ${this.height}x${this.width} ${this.documentData.length} bytes`;
  }
}
