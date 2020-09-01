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
import {ImageMagick} from "@imagemagick/magick-wasm";
import {DocumentNode} from './document-node';

/**
 * Reads the file and provides a tree-view of all layers in the document.
 * Each layer can be clicked to give view the image in that particular layer
 * or group.
 *
 * @since 0.1.0
 */
export class LayerTreeProvider implements vscode.TreeDataProvider<DocumentNode> {

  public constructor(private context: vscode.ExtensionContext) {
    console.log('Initialized instance of LayerProvider.');
  }

  public onDidChangeTreeData?: vscode.Event<DocumentNode> | undefined;

  public getTreeItem(element: DocumentNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(element?: DocumentNode): vscode.ProviderResult<DocumentNode[]> {
    console.log('Getting document children of an element.');

    if (element)
      return element.children;

    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
      console.log('Tried to get children of document with no active text editor.');
      return null;
    }

    this.loadDocument(activeTextEditor);
  }

  public loadDocument(textEditor: vscode.TextEditor): void {
    const textDocument: vscode.TextDocument = textEditor.document;
    const fileName = textDocument.fileName;
    const uri = textDocument.uri;

    console.debug('Active document is set to:', fileName);
    console.info('Reading file from URI:', uri);

    vscode.workspace.fs.readFile(textDocument.uri).then((data) => {
      try {
        ImageMagick.read(data, (image) => {
          console.debug('Succesfully read document:', image.toString());
        });
      } catch (err) {
        console.error('Failed to load data as MagickImage.\n', err);
      }
    });
  }
}
