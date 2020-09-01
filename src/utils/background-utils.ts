import { MagickBackground } from "../configuration/magick-background";
import { CheckeredBackground } from "../configuration/backgrounds/checkered-background";
import { TransparentBackground } from "../configuration/backgrounds/transparent-background";
import { CustomBackground } from "../configuration/backgrounds/custom-background";

/**
 * Wrapper around the background implementations for convinient and
 * centralized access.
 *
 * @since 0.4.0
 */
export class BackgroundUtils {

  /** An array of all background implementations. */
  public static readonly All: Map<string, () => MagickBackground> = new Map<string, () => MagickBackground>()
    .set('checkered', () => new CheckeredBackground())
    .set('transparent', () => new TransparentBackground())
    .set('custom', () => new CustomBackground());

  /**
   * Statically obtains the required background configuration.
   *
   * @param id The ID of the background to use.
   */
  public static getBackgroundById(id: string): MagickBackground {
    if (!id)
      throw new Error('Background ID can not be null or blank');

    const background: (() => MagickBackground) | undefined = this.All.get(id);

    if (!background)
      throw new Error('No background option has the specified ID');

    return background();
  }

  /**
   * Convert a JSON object to a valid CSS formatted
   * set of style rulesets.
   *
   * @param properties A JSON object that represents CSS properties to convert.
   */
  public static convertToCssProperties(properties: any): string {
    let css: string = '';

    for (const property in properties)
      css += `${property}:${properties[property]};`

    return css;
  }
}
