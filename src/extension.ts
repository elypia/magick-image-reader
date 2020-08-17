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
