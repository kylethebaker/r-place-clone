/**
 * Provides interface for working the canvas
 */
export default class CanvasWrapper {

  /**
   * Creates a new CanvasWrapper
   *
   * @param {HTMLCanvasElement} canvasElement
   *   The canvas DOM element to wrap
   * @param {number} blockSize
   *   Width/height of blocks in pixels
   * @param {number} numBlocks
   *   How many blocks per row/column
   */
  constructor(canvasElement, blockSize) {
    this.blockSize = blockSize;
    this.numCols = 100;

    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");

    this.hoverCanvas = this.createHoverLayer();
    this.hoverCtx = this.hoverCanvas.getContext("2d");
    this.currentlyHovered = [false, false];

    this.canvasWrapper = document.querySelector("#canvasWrapper");
    this.canvas.style.border = "2px solid red";

    this.resizeCanvas();
  }

  createHoverLayer() {
    const hoverLayer = document.createElement("canvas");
    hoverLayer.setAttribute("id", "canvasHover");
    hoverLayer.style.border ="2px solid transparent";
    this.canvas.parentNode.insertBefore(hoverLayer, this.canvas.nextSibling);
    return hoverLayer;
  }

  /**
   * Initializes the canvas DOM element
   */
  resizeCanvas() {
    const pxPerRow = this.blockSize * this.numCols;
    this.canvas.setAttribute("width", pxPerRow);
    this.canvas.setAttribute("height", pxPerRow);
    this.hoverCanvas.setAttribute("width", pxPerRow);
    this.hoverCanvas.setAttribute("height", pxPerRow);
    this.canvasWrapper.style.width = (pxPerRow + 4).toString() + "px";
  }

  /**
   * Rescales the cavas to a new blocksize
   *
   * @param {Uint8Array} bitmap
   *   Board bitmap data
   * @param {array} colors
   *   Color palette of size 16
   * @param {number} blockSize
   *   The new block size
   *
   * @return {Promise}
   */
  rescaleCanvas(bitmap, colors, blockSize) {
    this.blockSize = blockSize;
    return this.loadFromBitmap(bitmap, colors);
  }

  /**
   * Loads canvas data from the bitmap
   *
   * @param {Uint8Array} bitmap
   *   The binary bitmap data
   * @param {array} colors
   *   Color palette of size 16
   *
   * @return {Promise}
   */
  loadFromBitmap(bitmap, colors) {
    return new Promise((resolve, reject) => {
      this.numCols = Math.sqrt(2 * bitmap.length);
      this.resizeCanvas();

      for (let x = 0; x < this.numCols; x++) {
        for (let y = 0; y < this.numCols; y++) {
          const wideOffset = x + (this.numCols * y);
          const upperBits = (wideOffset % 2 === 0);
          const offset = Math.floor(wideOffset / 2);
          const wideVal = bitmap[offset];
          const color = upperBits
            ? (wideVal & 0xF0) >> 4
            : (wideVal & 0x0F);

          this.fillBlock(x, y, colors[color]);
        }
      }

      resolve();
    });
  }

  /**
   * Given a Block position, returns the x,y coordinates of the top-left pixel
   *
   * @param {number} x
   *   Block x coordinate
   * @param {number} y
   *   Block y coordinate
   *
   * @return {Array}
   *   Top left pixel in the form [x, y]
   */
  getPixelsFromBlock(x, y) {
    return [x, y].map(x =>  x * this.blockSize);
  }

  /**
   * Given a coordinate pair in pixels, returns the corresponding Block's position
   *
   * @param {number} x
   *   Pixel x coordinate
   * @param {number} y
   *   Pixel y coordinate
   *
   * @return {Array}
   *   Block coordinates in the form [x, y]
   */
  getBlockFromPixels(x, y) {
    return [x, y].map(x => Math.floor(x / this.blockSize));
  }

  /**
   * Given a block coordinate pair, get the hex color value of the block
   *
   * @param {number} x
   *   Block x coordinate
   * @param {number} y
   *   Block y coordinate
   *
   * @return {string}
   *   Hex color string
   */
  getBlockColor(x, y) {
    const [r, g, b, _] = this.getBlockColorArray(x, y);
    return "#" + ((r << 16) | (g << 8) | b).toString(16);
  }

  /**
   * Given a block coordinate pair, get the blocks rgba color as a byte array
   *
   * @param {number} x
   *   Block x coordinate
   * @param {number} y
   *   Block y coordinate
   *
   * @return {Uint8Array}
   *   Byte array in the form [r, g, b, a];
   */
  getBlockColorArray(x, y) {
    const [px, py] = this.getPixelsFromBlock(x, y);
    return this.ctx.getImageData(px, py, 1, 1).data;
  }

  /**
   * Fills the block at the given position with whatever color
   *
   * @param {number} x
   *   Block x coordinate
   * @param {number} y
   *   Block y coordinate
   * @param {string} color
   *   Valid css color
   */
  fillBlock(x, y, color) {
    this.ctx.fillStyle = color;
    const [px, py] = this.getPixelsFromBlock(x, y)
    this.ctx.fillRect(px, py, this.blockSize, this.blockSize);
  }

  /**
   * Adds a hover indicator
   */
  registerHoverListener(colorPicker) {
    this.hoverCanvas.onmousemove = (e) => {
      const [x, y] = this.getBlockUnderMouse(e);
      const [curX, curY] = this.currentlyHovered;
      if (curX === x && curY === y) {
        return;
      } else {
        const [px, py] = this.getPixelsFromBlock(curX, curY);
        this.hoverCtx.clearRect(px, py, this.blockSize, this.blockSize);
      }
      this.currentlyHovered = [x, y];
      const [px, py] = this.getPixelsFromBlock(x, y);
      this.hoverCtx.fillStyle = colorPicker.getCurrentRgb();
      this.hoverCtx.fillRect(px, py, this.blockSize, this.blockSize);
    }
  }

  /**
   * Given a MouseEvent, returns the block underneath the cursor
   *
   * @param {MouseEvent} e
   *   A mouse event
   *
   * @return {array}
   *   Block coords in the form [x, y, color]
   */
  getBlockUnderMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return this.getBlockFromPixels(x, y);
  }

}
