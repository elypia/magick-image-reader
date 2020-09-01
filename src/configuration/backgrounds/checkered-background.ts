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
