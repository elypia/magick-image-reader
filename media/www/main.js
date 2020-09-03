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

  /** The last recorded pointerX position. */
  let pointerX = 0;

  /** The last recoreded pointerY position. */
  let pointerY = 0;

  /** The translation to apply on the X axis from manually dragging the image. */
  let translateX = 0;

  /** The translation to apply on the Y axis from manually dragging the image. */
  let translateY = 0;

  /** Translation to apply to the image from panning. */
  let transformTranslate = "translate(0)";

  /**
   * True by default, if we should set the scale dynamically
   * as the view changes.
   *
   * This will be automatically set to false if the user
   * interacts with the view at all such as manually panning or zooming.
   */
  let bestFit = true;

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

  let isMoving = false;

  body.addEventListener('pointermove', (/** @type {PointerEvent} */ event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (!isMoving)
      return;

    event.preventDefault();

    console.log(scale);

    translateX += event.movementX;
    translateY += event.movementY;

    const left = (body.clientWidth - magickImage.naturalWidth) / 2;
    const top = (body.clientHeight - magickImage.naturalHeight) / 2;

    const translate = `translate(${translateX}px, ${translateY}px)`;
    transformTranslate = translate;
    updateMagickImageWrapper();
  });

  const onPointerUp = (/** @type {PointerEvent} */ event) => {
    console.log(`Pointerup event received: ${event.button}`)
    isMoving = false;
    body.classList.remove('moving');
  };

  body.addEventListener('pointerdown', (event) => {
    if (event.button !== 0)
      return;

    console.log(`Pointerdown event received: ${event.button}`)

    event.preventDefault();

    body.classList.add('moving');
    isMoving = true;
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

  function fitImageToBody() {
    const fitWidth = body.clientWidth / documentContext._width;
    const fitHeight = body.clientHeight / documentContext._height;

    const newScale = Math.min(fitWidth, fitHeight);

    if (newScale < 1)
      updateScale(newScale);
  }

  magickImage.addEventListener('load', fitImageToBody)

  window.addEventListener('resize', () => {
    console.log(body.clientWidth, body.clientHeight);

    if (bestFit)
      fitImageToBody();
  });

  function updateMagickImageWrapper() {
    magickImageWrapper.style.transform = transformTranslate;
  }

  /**
   * @param {number} newScale
   */
  function updateScale(newScale) {
    scale = newScale;
    console.log('Scale updated to:', scale);

    magickImage.style.width = `${documentContext._width * newScale}px`;
    magickImage.style.height = `${documentContext._height * newScale}px`;
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

    if (!fitsScale(newScale))
      return;

    updateScale(newScale);
  }, {passive: false});

  /**
   * @param {number} scale The scale to check.
   * @returns {boolean} If the scale is within the bounds of the image viewer.
   */
  function fitsScale(scale) {
    return scale >= minScale && scale <= maxScale;
  }
}());
