import * as vscode from 'vscode';
import { MagickBackground } from '../magick-background';

/**
 * Renders CSS that the user configured behind the image.
 *
 * @since 0.4.0
 */
export class CustomBackground implements MagickBackground {

  public getBackground(config: vscode.WorkspaceConfiguration): unknown {
    return config.get<unknown>('backgroundCustomCss', {});
  }
}
