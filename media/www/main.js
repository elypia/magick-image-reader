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
     * @param {HTMLElement} wrapper
     */
    constructor(wrapper) {
      this.wrapper = wrapper;
    }

    async loadImage(documentContext) {

      const imgElement = document.createElement('img');
      imgElement.width = documentContext._width;
      imgElement.height = documentContext._height;

      const mimeType = documentContext._mimeType.toString();

      // if (documentContext._modified) {
        const documentData = new Uint8Array(documentContext._documentData.data);
        const blob = new Blob([documentData], {
          'type': mimeType
        });
        const url = URL.createObjectURL(blob);
        imgElement.src = url;
      // } else {
      //   imgElement.src = documentContext.webviewUri;
      // }

      console.log('Displaying image with MIME type:', mimeType);
      this.wrapper.append(imgElement);
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

  /**
   * The initial state of the context is sent through a meta field
   * in the <head> since it's a lot quicker to load.
   */
  function getInitialContext() {
    const initialContentElement = document.getElementById('initial-context');
    const initialContent = JSON.parse(initialContentElement.getAttribute('data-initial-context'));
    return initialContent;
	}

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  /** The document body. */
  const body = document.body;

  /** Elements with this class will get hidden from view. */
  const hiddenClass = 'hidden';

  /** The element which contains the canvas and anything else with it. */
  const wrapperElement = document.getElementById('magick-image-wrapper');

  /** All elements that start with the hidden class, should be unhidden when ready. */
  const initiallyHiddenElements = document.getElementsByClassName(hiddenClass);

  /** These elements should be hidden after the document is ready. */
  const hideAfterElements = document.getElementsByClassName('hide-after');

  const editor = new MagickEditor(wrapperElement);

  /** The context of this document, this can be updated to change the view. */
  const documentContext = getInitialContext();

  editor.loadImage(documentContext);
  wrapperElement.style.height = documentContext._height;
  wrapperElement.style.width = documentContext._width;

  for (const initiallyHiddenElement of initiallyHiddenElements)
    initiallyHiddenElement.classList.remove(hiddenClass);

  for (const hideAfterElement of hideAfterElements)
    hideAfterElement.classList.add(hiddenClass);

  window.addEventListener('message', (event) => {
    switch (event.type) {
      default:
        console.warn('Unknown event type received.');
    }
  });

  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  const onPointerMove = (/** @type {PointerEvent} */ event) => {
    event.preventDefault();
    pos1 = pos3 - event.clientX;
    pos2 = pos4 - event.clientY;
    pos3 = event.clientX;
    pos4 = event.clientY;

    wrapperElement.style.top = (wrapperElement.offsetTop - pos2) + "px";
    wrapperElement.style.left = (wrapperElement.offsetLeft - pos1) + "px";
  };

  const onPointerUp = (/** @type {PointerEvent} */ event) => {
    body.removeEventListener('pointermove', onPointerMove);
    body.classList.remove('moving');
  };

  body.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pos3 = event.clientX;
    pos4 = event.clientY;

    body.classList.add('moving');
    body.addEventListener('pointermove', onPointerMove);
  });

  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointerleave', onPointerUp);

  // body.addEventListener('wheel', (/** @type {WheelEvent} */ event) => {
  //   if (event.ctrlKey)
  //     event.preventDefault();

  //   const isScrollWheelKeyPressed = documentContext._isMac ? event.altKey : event.ctrlKey;

  //   if (!isScrollWheelKeyPressed && !event.ctrlKey)
  //     return;

  //   if (scale === 'fit')
  //     firstZoom();

  //   const delta = event.deltaY > 0 ? 1 : -1;
  //   updateScale(scale * (1 - delta * SCALE_PINCH_FACTOR));
  // }, { passive: false });
}());
