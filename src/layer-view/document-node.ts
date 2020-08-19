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

/**
 * Represents a page, group, layer, or image, within a file, and provides
 * contextualized information to the Visual Studio Code UI depending
 * on the file format.
 * 
 * @since 0.1.0
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
