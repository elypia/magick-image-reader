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

import * as vscode from 'vscode';
import { initializeImageMagick } from '@imagemagick/magick-wasm';
import { Magick } from '@imagemagick/magick-wasm/magick'
import { Quantum } from '@imagemagick/magick-wasm/quantum';
import { MagickEditorProvider } from './magick-editor/magick-editor-provider';
import { LayerTreeProvider } from './layer-view/layer-tree-provider';

export function activate(context: vscode.ExtensionContext): void {
  console.log('Magick Image Reader extension is now active.');
  
  initializeImageMagick().then(async () => {
    console.info('ImageMagick Version:', Magick.imageMagickVersion);
    console.info('Delegates:', Magick.delegates);
    console.info('Quantum Depth:', Quantum.depth);
  });

  const readImageId = 'magickImageReader.readImage';
  const editorProvider = new MagickEditorProvider(context);
  const options = {
    supportsMultipleEditorsPerDocument: false
  };
  
  const layerViewerId = 'magickImageReader.layerViewer';
  const layerViewer = new LayerTreeProvider(context);

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(readImageId, editorProvider, options), 
    vscode.window.registerTreeDataProvider(layerViewerId, layerViewer)
  );
}

export function deactivate(): void {
  console.log('Magick Image Reader extension is now inactive.');
}
