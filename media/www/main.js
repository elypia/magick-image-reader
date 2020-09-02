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

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  /** The document body. */
  const body = document.body;

  /** The element which contains the canvas and anything else with it. */
  const magickImageWrapper = document.getElementById('magick-image-wrapper');

  /** The context of this document, this can be updated to change the view. */
  const documentContext = getInitialContext();

  /** The image element that contains the file opened. */
  const magickImage = createImage(documentContext);

  /** The translation to apply on the X axis from manually dragging the image. */
  let translateX = 0;

  /** The translation to apply on the Y axis from manually dragging the image. */
  let translateY = 0;

  magickImageWrapper.append(magickImage);
  magickImageWrapper.style.height = documentContext._height;
  magickImageWrapper.style.width = documentContext._width;

  window.addEventListener('message', (event) => {
    switch (event.type) {
      default:
        console.warn('Unknown event type received.');
    }
  });

  /**
   * The initial state of the context is sent through a meta field
   * in the <head> since it's a lot quicker to load.
   *
   * @returns The the initial state of the document context
   * this may change while the image is open.
   */
  function getInitialContext() {
    const initialContentElement = document.getElementById('initial-context');
    const initialContent = JSON.parse(initialContentElement.getAttribute('data-initial-context'));
    return initialContent;
  }

  /**
   * @param {any} documentContext
   * @returns {HTMLImageElement}
   */
  function createImage(documentContext) {
    const magickImage = document.createElement('img');
    magickImage.id = 'magick-image';
    magickImage.width = documentContext._width;
    magickImage.height = documentContext._height;

    const mimeType = documentContext._mimeType.toString();

    // if (documentContext._modified) {
      const documentData = new Uint8Array(documentContext._documentData.data);
      const blob = new Blob([documentData], {
        'type': mimeType
      });
      const url = URL.createObjectURL(blob);
      magickImage.src = url;
    // } else {
    //   imgElement.src = documentContext.webviewUri;
    // }

    console.log('Creating image with MIME type:', mimeType);
    return magickImage;
  }

  const onPointerMove = (/** @type {PointerEvent} */ event) => {
    event.preventDefault();

    translateX += event.movementX;
    translateY += event.movementY;

    const translate = `translate(${translateX}px, ${translateY}px)`;

    console.log('#magick-image translate style has been set to:', translate);
    magickImageWrapper.style.transform = translate;
  };

  const onPointerUp = (/** @type {PointerEvent} */ event) => {
    body.removeEventListener('pointermove', onPointerMove);
    body.classList.remove('moving');
  };

  body.addEventListener('pointerdown', (event) => {
    if (event.button !== 0)
      return;

    event.preventDefault();

    body.classList.add('moving');
    body.addEventListener('pointermove', onPointerMove);
  });

  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointerleave', onPointerUp);

  /** TESTING */

  const minScale = 0.00391;
  const maxScale = 256;

  /**
   * The scale to display the image at, intialized to fit
   * to the parent element.
   *
   * @type {number}
   */
  let scale = 1;

  magickImage.addEventListener('load', () => {
    const fitWidth = body.clientWidth / magickImage.naturalWidth;
    const fitHeight = body.clientHeight / magickImage.naturalHeight;

    scale = Math.min(fitWidth, fitHeight);

    updateScale(scale);
    console.log('Scale initialized to:', scale);
  });

  /**
   * @param {number} newScale
   */
  function updateScale(newScale) {
    if (!magickImage || !magickImage.parentElement)
      return;

    scale = newScale;
    console.log('Scale updated to:', scale);

    const dx = (window.scrollX + body.clientWidth / 2) / body.scrollWidth;
    const dy = (window.scrollY + body.clientHeight / 2) / body.scrollHeight;

    magickImage.style.width = `${(magickImage.naturalWidth * newScale)}px`;
    magickImage.style.height = `${(magickImage.naturalHeight * newScale)}px`;

    const newScrollX = body.scrollWidth * dx - body.clientWidth / 2;
    const newScrollY = body.scrollHeight * dy - body.clientHeight / 2;

    window.scrollTo(newScrollX, newScrollY);
  }

  body.addEventListener('wheel', (/** @type {WheelEvent} */ event) => {
    if (event.ctrlKey)
      event.preventDefault();

    const isScrollWheelKeyPressed = (documentContext._isMac) ? event.altKey : event.ctrlKey;

    if (!isScrollWheelKeyPressed && !event.ctrlKey)
      return;

    const scaleDelta = 0.075;
    const delta = (event.deltaY > 0) ? scaleDelta : -scaleDelta;
    const newScale = scale * (1 - delta);

    if (newScale < minScale || newScale > maxScale)
      return;

    updateScale(newScale);
  }, {passive: false});
}());
