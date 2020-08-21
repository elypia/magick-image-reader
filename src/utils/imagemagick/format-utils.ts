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

import { MagickFormat } from "@imagemagick/magick-wasm/magick-format";
import { MagickFormatInfo } from "@imagemagick/magick-wasm/magick-format-info";
import { Magick } from "@imagemagick/magick-wasm/magick";
import { MimeType } from "./mime-type";

/**
 * Utilities for file and binary formats.
 * 
 * @since 0.2.0
 */
export class FormatUtils {

  /**
   * @param path A path to take the extension from.
   * @returns The extension of the path, or undefined if it has no extension.
   * @throws If null or empty string is provided, or path has no extension.
   */
  public static getExtension(path: string): string {
    if (!path)
      throw new Error('Can\'t get the extension from a null or empty string');

    const split = path.split('.');
    const length = split.length;

    if (length == 1)
      return 'Path provided has no file extension';

    return split[length - 1];
  }

  /**
   * @param extension A file extension to return typed information for.
   * @returns A MagickFormatInfo object which static information on the format.
   * @throws If the file extension is not known to ImageMagick.
   */
  public static getFormatInfo(extension: string): MagickFormatInfo {
    if (!extension)
      throw new Error('Can\'t map null or empty extension to type MagickFormat');

    extension = extension.toUpperCase();

    for (const formatInfo of Magick.supportedFormats) {
      if (extension === formatInfo.format)
        return formatInfo;
    }

    throw new Error('Format not compatible with ImageMagick, please notify the developer');
  }

  /**
   * @param format The document format to get the MIME type for.
   * @returns The MIME type of the specified format.
   * @throws If MIME type for the specified format is not known.
   */
  public static getMimeType(format: MagickFormat): MimeType {
    switch (format) {
      case MagickFormat.Bmp: 
      case MagickFormat.Bmp2:
      case MagickFormat.Bmp3:
        return MimeType.Bmp;
      case MagickFormat.Gif:
      case MagickFormat.Gif87:
        return MimeType.Gif;
      case MagickFormat.Ico:
      case MagickFormat.Cur:
        return MimeType.Icon;
      case MagickFormat.Jpg:
      case MagickFormat.Jpeg:
      case MagickFormat.Pjpeg:
        return MimeType.Jpeg;
      case MagickFormat.Png:
      case MagickFormat.Png00:
      case MagickFormat.Png8:
      case MagickFormat.Png24:
      case MagickFormat.Png32:
      case MagickFormat.Png48:
      case MagickFormat.Png64:
        return MimeType.Png;
      case MagickFormat.Svg:
        return MimeType.Svg;
      case MagickFormat.Tiff:
      case MagickFormat.Tiff64:
        return MimeType.Tiff;
      case MagickFormat.Webp:
        return MimeType.Webp;
      default:
        throw new Error('MIME type not known for format');
    }
  }
}