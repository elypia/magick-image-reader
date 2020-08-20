import * as vscode from 'vscode';
import { MagickImage } from '@imagemagick/magick-wasm/magick-image';

/**
 * Stores the context for a MagickDocument.
 * This ensures all relevent information is sent to the webview
 * at once to give it context on the image it's about to render.
 * 
 * @since 0.2.0
 */
export class MagickDocumentContext {

  /** The Visual Studio Code URI of the resource. */
  public documentUri: vscode.Uri;

  /** The ImageMagick view of the document. */
  public magickImage: MagickImage;

  /** The raw data that represents the document. */
  public documentData: Uint8Array;

  /** The height of the document. */
  public height: number;

  /** The width of the document. */
  public width: number;

  public constructor(
    documentUri: vscode.Uri, 
    magickImage: MagickImage,
    documentData: Uint8Array, 
    height: number, 
    width: number
  ) {
    this.documentUri = documentUri;
    this.magickImage = magickImage;
    this.documentData = documentData;
    this.height = height;
    this.width = width;
  }

  public toString(): string {
    return `${this.documentUri} ${this.height}x${this.width} ${this.documentData.length} bytes`;
  }
}
