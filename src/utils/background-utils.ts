/*
 * Copyright 2020-2020 Elypia CIC and Contributors (https://gitlab.com/Elypia/magick-image-reader/-/graphs/master)
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
}
