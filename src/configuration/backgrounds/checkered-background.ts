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

import * as vscode from 'vscode';
import { MagickBackground } from '../magick-background';

/**
 * The default option, renders a checkered background behind the image.
 *
 * @since 0.4.0
 */
export class CheckeredBackground implements MagickBackground {

  public getBackground(config: vscode.WorkspaceConfiguration): unknown {
    return {
      'background-image': 'linear-gradient(to right, #18181880, #18181880), linear-gradient(to right, #0c0c0c 50%, #181818 50%), linear-gradient(to bottom, #0c0c0c 50%, #181818 50%)',
      'background-blend-mode': 'normal, difference, normal',
      'background-size': '14px 14px'
    };
  }
}
