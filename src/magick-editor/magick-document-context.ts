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
  public _documentUri: vscode.Uri;

  /** If the data represents the URI, or has been modified in memory. */
  public _modified: boolean;

  /** The raw data that represents the viewable document. */
  public _documentData: Uint8Array;

  /** The MIME type of the data, this may not be the same as the original document. */
  public _mimeType: MimeType;

  /** The width of the document. */
  public _width: number;

  /** The height of the document. */
  public _height: number;

  public constructor(
    documentUri: vscode.Uri, 
    modified: boolean,
    documentData: Uint8Array,
    mimeType: MimeType, 
    width: number,
    height: number
  ) {
    this._documentUri = documentUri;
    this._modified = modified;
    this._documentData = documentData;
    this._mimeType = mimeType;
    this._width = width;
    this._height = height;
  }

  public get documentUri(): vscode.Uri {
    return this._documentUri;
  }

  public get modified(): boolean {
    return this._modified;
  }

  public get documentData(): Uint8Array {
    return this._documentData;
  }

  public get mimeType(): MimeType {
    return this._mimeType;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public toString(): string {
    return `${this._documentUri} ${this._width}x${this._height} ${this._documentData.length} bytes`;
  }
}
