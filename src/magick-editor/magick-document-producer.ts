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
import { MagickImage } from '@imagemagick/magick-wasm/magick-image';
import { MagickFormat } from '@imagemagick/magick-wasm/magick-format';
import { MagickDocumentDelegate } from './magick-document-delegate';
import { MagickFormatInfo } from '@imagemagick/magick-wasm/magick-format-info';
import { FormatUtils } from '../utils/imagemagick/format-utils';
import { MagickDocument } from './magick-document';
import { MagickDocumentContext } from './magick-document-context';
import { MimeType } from '../utils/imagemagick/mime-type';

/**
 * @since 0.2.0
 */
export class MagickDocumentProducer {

  /** Formats that can be displayed directly in an <img> tag without conversion. */
  private static imgFriendlyFormats: MagickFormat[] = [
    MagickFormat.Bmp,
    MagickFormat.Bmp2,
    MagickFormat.Bmp3,
    MagickFormat.Gif,
    MagickFormat.Gif87,
    MagickFormat.Ico,
    MagickFormat.Cur,
    MagickFormat.Jpg,
    MagickFormat.Jpeg,
    MagickFormat.Pjpeg,
    MagickFormat.Png,
    MagickFormat.Png00,
    MagickFormat.Png8,
    MagickFormat.Png24,
    MagickFormat.Png32,
    MagickFormat.Png48,
    MagickFormat.Png64,
    MagickFormat.Svg,
    MagickFormat.Tiff,
    MagickFormat.Tiff64,
    MagickFormat.Webp
  ];

  public static async create(
    uri: vscode.Uri,
    backupId: string | undefined,
    delegate: MagickDocumentDelegate
  ): Promise<MagickDocument | PromiseLike<MagickDocument>> {
    const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;
    const documentData = await MagickDocumentProducer.readFile(dataFile);

    console.log('Creating MagickDocument to send to webview.');
    return new MagickDocument(documentData, delegate);
  }

  /**
   * @param uri The location of the document to load.
   */
  public static async readFile(uri: vscode.Uri): Promise<MagickDocumentContext> {
    if (uri.scheme === 'untitled')
      throw new Error('Can\'t create new file with Image Magick Reader editor');

    let documentContext: MagickDocumentContext | undefined = undefined;

    await vscode.workspace.fs.readFile(uri).then((fileData: Uint8Array) => {
      console.log('Loaded document of length:', fileData.length);
      const fileFormat = FormatUtils.getFormat(uri.path);
      const magickFileFormat = (fileFormat) ? FormatUtils.getFormatInfo(fileFormat) : undefined;

      if (magickFileFormat && !magickFileFormat.isReadable)
        throw new Error(`Unable to read ${magickFileFormat.format} files, please notify the developer`);

      try {
        ImageMagick.read(fileData, (image: MagickImage) => {
          console.debug('Succesfully read document:', image.toString());
          const imageFormat: string = image.format;
          const magickImageFormat: MagickFormatInfo = FormatUtils.getFormatInfo(imageFormat);

          if (fileFormat) {
            if (!magickFileFormat)
              vscode.window.showWarningMessage(`File has no extension, but binary data represents ${magickImageFormat.format}.`);

            else if (magickFileFormat.format !== magickImageFormat.format)
              vscode.window.showWarningMessage(`File extension was ${magickFileFormat.format}, but binary data represents ${magickImageFormat.format}.`);
          }

          if (this.imgFriendlyFormats.includes(magickImageFormat.format)) {
            console.log('Format is natively supported by img element, not converting.');
            const mime = FormatUtils.getMimeType(magickImageFormat.format);
            documentContext = new MagickDocumentContext(uri, image, fileData, mime, image.height, image.width);
          } else {
            image.write((bytesToWrite) => {
              console.log('Converted document to PNG for previewing with length:', bytesToWrite.length);
              const convertedBytes = Buffer.from(bytesToWrite);
  
              documentContext = new MagickDocumentContext(uri, image, convertedBytes, MimeType.Png, image.height, image.width);
            }, MagickFormat.Png);
          }
        });
      } catch (err) {
        console.error('Failed to load document or convert to a viewable format.\n', err);
        throw err;
      }
    });

    if (!documentContext)
      throw new Error('Unable to convert document to viewable format');

    return documentContext;
  }
}