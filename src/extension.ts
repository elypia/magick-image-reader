import * as vscode from 'vscode';
import { initializeImageMagick } from '@imagemagick/magick-wasm';
import { MagickEditorProvider } from './magick-editor/magick-editor-provider';
import { LayerTreeProvider } from './layer-view/layer-tree-provider';

let initialized = false;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Magick Image Reader extension is now active.');

  if (!initialized) {
    console.log('Initializing ImageMagick.')
    await initializeImageMagick();
    initialized = true;
  }

  const subscription = vscode.window.registerCustomEditorProvider(
    'magickImageReader.readImage', 
    new MagickEditorProvider(context), 
    { supportsMultipleEditorsPerDocument: false }
  );

  context.subscriptions.push(subscription);
  
  vscode.window.registerTreeDataProvider('magickImageReader.layerViewer', new LayerTreeProvider(context));
}

export function deactivate() {
  console.log('Magick Image Reader extension is now inactive.');
}
