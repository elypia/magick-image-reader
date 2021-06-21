<div align="center">

# Magick Image Reader
[![Matrix]][matrix-community] [![Installs]][vscode-market-link] [![Downloads]][vscode-market-link] [![Build]][gitlab] [![Donate]][elypia-donate]
</div>

**HEADS UP: This extension is in very early development and depends heavily on [Magick.WASM](https://github.com/dlemstra/Magick.WASM) which is also in very early development. While this extension is functional, it shouldn't be considered stable.**

## About
**Magick Image Reader** is an extension for [Visual Studio Code](https://code.visualstudio.com/)
which adds support for reading [over 100 image formats](https://imagemagick.org/script/formats.php)
without leaving the application. It's primary use is for quickly accessing images when managing image
repositories without the need to leave Visual Studio Code or open another program.

This project would've been a massive pain without free and open-source software
like [ImageMagick](https://imagemagick.org/) and [Magick.WASM](https://github.com/dlemstra/Magick.WASM) around.
If this is useful for your workflow, please also consider checking them out or sponsoring their work.

## Features
This extension was made with one feature in mind, which is to read
additional document formats, however as we're integrating with
ImageMagick, we'll be additional features in future to make the most out of it.

The first time you interact with the extension there will be a initializaton
which will last a few seconds, from there all images should load relatively fast.

### Reading Additional Document Formats
The primary goal is to view additional file formats in Visual Studio Code,
the following have been verified to work well with this extension, excluding
formats that Visual Studio Code already supported natively:
* XCF (GIMP)
* PSD (Photoshop)
* DCM
* DDS
* HDR
* HEIC
* MNG
* PBM
* PCX
* PFM
* PGM
* PNM
* PPM
* SGI
* XBM

<!--
### Layer Tree View [Not Implemented]
Simiarly to the **NPM Scripts** or **Outline** panels on the side
of Visual Studio Code, one can view a **Layers** tree-view which will
list all nodes in a layered document such as `ORA` or `PSD`, including
groups and layers.
-->

<!--
### File Format Conversion [Not Implemented]
Through the UI, one can right-click an image file supported by this extension
or execute a command to convert the image to another format.
-->

<!--
### Basic Graphics Manipulation [Not Implemented]
This extension **by no means** is intended to be a replacement for a real
graphics design tool such as GIMP, however basic support is provided for resizing
and transforming images, or selections of images.
Some tools may be available through the UI, while others will be visible
in the editor when you open an image.
-->

[matrix-community]: https://matrix.to/#/+elypia:matrix.org "Matrix Invite"
[vscode-market-link]: https://marketplace.visualstudio.com/items?itemName=elypia.magick-image-reader
[gitlab]: https://gitlab.com/Elypia/magick-image-reader/commits/master "Repository on GitLab"
[elypia-donate]: https://elypia.org/donate "Donate to Elypia"

[Matrix]: https://img.shields.io/matrix/elypia:matrix.org?logo=matrix "Matrix Shield"
[Installs]: https://img.shields.io/visual-studio-marketplace/i/elypia.magick-image-reader?color=%23007ACC&logo=visual%20studio%20code "Visual Studio Code Marketplace"
[Downloads]: https://img.shields.io/visual-studio-marketplace/d/elypia.magick-image-reader?color=%23007ACC&logo=visual%20studio%20code
[Build]: https://gitlab.com/Elypia/magick-image-reader/badges/master/pipeline.svg "GitLab Build Shield"
[Donate]: https://img.shields.io/badge/elypia-donate-blueviolet "Donate Shield"
