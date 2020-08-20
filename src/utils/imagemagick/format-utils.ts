import { MagickFormat } from "@imagemagick/magick-wasm/magick-format";
import { MagickFormatInfo } from "@imagemagick/magick-wasm/magick-format-info";
import { ImageMagick } from "@imagemagick/magick-wasm";
import { Magick } from "@imagemagick/magick-wasm/magick";

/**
 * Utilities for file and binary formats.
 * 
 * @since 0.2.0
 */
export class FormatUtils {

  /** Aliases for the formats supported my ImageMagick but not statically known. */
  private static readonly formatAliases = new Map<MagickFormat, string[]>()
    .set(MagickFormat.Tiff, [ 'TIF' ]);

  /**
   * @param path A path to take the extension from.
   * @returns The extension of the path, or undefined if it has no extension.
   */
  public static getFormat(path: string): string | undefined {
    return path.split('.').pop();
  }

  /**
   * @param extension A file extension to return typed information for.
   * @returns A MagickFormatInfo object which static information on the format.
   */
  public static getFormatInfo(extension: string): MagickFormatInfo {
    if (!extension)
      throw new Error('Can\'t map null or empty extension to type MagickFormat');

    extension = extension.toUpperCase();

    for (const formatInfo of Magick.supportedFormats) {
      if (extension === formatInfo.format)
        return formatInfo;

      const aliases = this.formatAliases.get(formatInfo.format);

      if (!aliases)
        continue;

      if (aliases.includes(extension))
        return formatInfo;
    }

    throw new Error('Format not compatible with ImageMagick, please notify the developer');
  }
}