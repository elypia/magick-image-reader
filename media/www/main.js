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

// @ts-check
"use strict";

(function () {

  class MagickEditor {

    /** 
     * @param {HTMLElement} parent 
     */
    constructor(parent) {
      this.wrapper = document.createElement('div');
      this.wrapper.style.position = 'relative';
      parent.append(this.wrapper);

      this.initialCanvas = document.createElement('canvas');
      this.initialCtx = this.initialCanvas.getContext('2d');
      this.wrapper.append(this.initialCanvas);
    }

    /**
     * @param {MagickDocumentContext} documentContext 
     */
    async reset(documentContext) {
      const documentData = new Uint8Array(documentContext.documentData.data);

      const img = await loadImageFromData(documentContext, documentData);
      this.initialCanvas.width = img.width;
      this.initialCanvas.height = img.height;

      console.log(JSON.stringify(img));
      this.initialCtx.drawImage(img, 0, 0);
    }
  }

  /**
   * @param {MagickDocumentContext} documentContext
   * @param {Uint8Array} documentData 
   * @return {Promise<HTMLImageElement>}
   */
  async function loadImageFromData(documentContext, documentData) {
    const blob = new Blob([documentData], { 'type': 'image/png' });
    const url = URL.createObjectURL(blob);

    try {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
	 * @param {number} value The value to round.
	 * @param {number} min
	 * @param {number} max
	 * @return {number}
	 */
	function round(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const body = document.body;

  const canvasId = 'magick-image';
  const hideInitiallyClass = 'hide-initially';

  const canvasElement = document.getElementById(canvasId);
  const initiallyHiddenElements = document.getElementsByClassName(hideInitiallyClass);
  
  const editor = new MagickEditor(canvasElement);

  window.addEventListener('message', (event) => {
    const { type, value, requestId } = event.data;

    canvasElement.style.height = value.height;
    canvasElement.style.width = value.width;

    console.log(JSON.stringify(value));

    switch (type) {
      case 'init':
        console.log('Loading initial data into canvas.');
        editor.reset(value);

        for (const initiallyHiddenElement of initiallyHiddenElements)
          initiallyHiddenElement.classList.remove(hideInitiallyClass);

        break;
      case 'update':
        const data = value.content ? new Uint8Array(value.content.data) : undefined;
        break;
      default:
        console.warn('Unknown event type received.');
    }
  });

  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  const startDragging = (event) => {
    event.preventDefault();
    pos1 = pos3 - event.clientX;
    pos2 = pos4 - event.clientY;
    pos3 = event.clientX;
    pos4 = event.clientY;

    canvasElement.style.top = (canvasElement.offsetTop - pos2) + "px";
    canvasElement.style.left = (canvasElement.offsetLeft - pos1) + "px";
  };

  const stopDragging = () => {
    body.removeEventListener('mousemove', startDragging);
  };

  body.addEventListener('mousedown', (event) => {
    event.preventDefault();
    pos3 = event.clientX;
    pos4 = event.clientY;

    body.addEventListener('mousemove', startDragging);
  });

  document.addEventListener('mouseup', stopDragging);
  document.addEventListener('mouseleave', stopDragging);

  vscode.postMessage({ type: 'ready' });
}());