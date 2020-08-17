import * as vscode from 'vscode';

/**
 * Represents a page, group, layer, or image, within a file, and provides
 * contextualized information to the Visual Studio Code UI depending
 * on the file format.
 * 
 * @since 1.0.0
 */
export class DocumentNode extends vscode.TreeItem {

    /** The parent node if this lives inside of a parent node like a group. */
    parent?: DocumentNode;

    /** All nodes within this node, such as nested layers inside of a group. */
    children: DocumentNode[];

    public constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.children = [];
    }

    public get tooltip(): string {
        return this.label;
    }

    public get description(): string {
        return this.label;
    }
}
