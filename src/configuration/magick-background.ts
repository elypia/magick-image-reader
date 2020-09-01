import * as vscode from 'vscode';

/**
 * @since 0.4.0
 */
export interface MagickBackground {
  getBackground(config: vscode.WorkspaceConfiguration): unknown;
}
