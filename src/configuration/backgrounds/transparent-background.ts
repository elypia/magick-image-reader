import * as vscode from 'vscode';
import { MagickBackground } from '../magick-background';

/**
 * Renders nothing behind the image.
 *
 * @since 0.4.0
 */
export class TransparentBackground implements MagickBackground {

  public getBackground(config: vscode.WorkspaceConfiguration): unknown {
    return {};
  }
}
