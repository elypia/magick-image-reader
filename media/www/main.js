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

(function () {

  class MagickEditor {

    /** 
     * @param {HTMLElement} parent 
     */
    constructor(parent) {
      this.ready = false;
      this._initElements(parent);
    }

    /** 
     * @param {HTMLElement} parent 
     */
    _initElements(parent) {
      this.wrapper = document.createElement('div');
      this.wrapper.style.position = 'relative';
      parent.append(this.wrapper);

      this.initialCanvas = document.createElement('canvas');
      this.initialCtx = this.initialCanvas.getContext('2d');
      this.wrapper.append(this.initialCanvas);
    }

    /**
     * @param {Uint8Array | undefined} data 
     */
    async reset(data) {
      console.log('Call to reset was made.');

      if (data) {

        try {
          const img = await loadImageFromData(data);
          this.initialCanvas.width = img.naturalWidth;
          this.initialCanvas.height = img.naturalHeight;
          
          console.log('Drawing image to screen.');
          this.initialCtx.drawImage(img, 0, 0);
          this.ready = true;
        } catch (err) {
          console.error(err);
        }
      }
    }

    /** 
     * @return {Promise<Uint8Array>} 
     */
    async getImageData() {
      const outCanvas = document.createElement('canvas');

      const outCtx = outCanvas.getContext('2d');
      outCtx.drawImage(this.initialCanvas, 0, 0);

      const blob = await new Promise(resolve => {
        console.log('Called toBlob in Promise.');
        outCanvas.toBlob(resolve, 'image/png')
      });

      return new Uint8Array(await blob.arrayBuffer());
    }
  }

  /**
   * @param {Uint8Array} initialContent 
   * @return {Promise<HTMLImageElement>}
   */
  async function loadImageFromData(initialContent) {
    const blob = new Blob([initialContent], { 'type': 'image/png' });
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

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const editor = new MagickEditor(document.querySelector('#magick-image'));

  window.addEventListener('message', async (event) => {
    const { type, value, requestId } = event.data;

    switch (type) {
      case 'init':
        console.log('Loading initial data into canvas.');
        await editor.reset(new Uint8Array(value.data));
        break;
      case 'update':
        const data = value.content ? new Uint8Array(value.content.data) : undefined;
        break;
      case 'getFileData':
        editor.getImageData().then(data => {
          vscode.postMessage({ type: 'response', value: {requestId, body: Array.from(data)} });
        });
        break;
      default:
        console.warn('Unknown event type received.');
    }
  });

  vscode.postMessage({ type: 'ready' });
}());