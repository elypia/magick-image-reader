import * as vscode from 'vscode';
import {ImageMagick} from "@imagemagick/magick-wasm";
import {DocumentNode} from './document-node';

/**
 * TODO: This is incomplete.
 * Reads the file and provides a tree-view of all layers in the document.
 * Each layer can be clicked to give view the image in that particular layer
 * or group.
 * 
 * @since 1.0.0
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