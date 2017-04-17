class LocalTable {

  /**
   * Constructs a new ColorTable
   *
   * @param {Uint8Array} buffer
   *   The bitmap buffer
   */
  constructor(bitmap=null) {
    this.bitmap = bitmap;
  }

  /**
   * Loads the table from a bitmap
   *
   * @param {Uint8Array} buffer
   *   The bitmap buffer
   */
  loadFromBitmap(bitmap) {
    this.bitmap = bitmap;
    this.numCols = Math.sqrt(2 * this.bitmap.length);
  }

  /**
   * Returns the bitmap
   *
   * @return {Uint8Array}
   *   The board bitmap
   */
  getBitmap() {
    return this.bitmap;
  }

  /**
   * Sets the color for a block
   *
   * @param {number} x
   *   The blocks x position
   * @param {number} y
   *   The blocks y position
   */
  setBlock(x, y, color) {
    const [offset, upperBits] = this.getOffsetFromPosition(x, y);
    const existingWide = this.bitmap[offset];
    let newWide = existingWide;

    const upperMask = 0xF0;
    const lowerMask = 0x0F;

    if (upperBits) {
      newWide &= lowerMask;
      newWide |= ((color << 4) & upperMask);
    } else {
      newWide &= upperMask;
      newWide |= (color & lowerMask);
    }

    this.bitmap[offset] = newWide;
  }

  /**
   * Returns the color value stored at a block position
   *
   * @param {number} x
   *   The blocks x position
   * @param {number} y
   *   The blocks y position
   *
   * @return {number}
   *   The color index stored at the position
   */
  getBlock(x, y) {
    const [offset, upperBits] = this.getOffsetFromPosition(x, y);
    const wide = this.bitmap[offset];

    return upperBits
      ? (wide & 0xF0) >> 4
      : (wide & 0x0F);
  }

  /**
   * Gets the byte offset of where the color data is stored
   *
   * Blocks are flattened from their grid structure and stored sequentially
   * in a byte array. Converting an x,y coordinate to the linear offset is
   * done using the equation x + yr, where x and y are coordinates and r is
   * number of blocks per row.
   *
   * Additionally, each byte is actually storing two blocks: one in the upper
   * nibble and one in the lower nibble. To get the exact offset we take the
   * byte offset, divide it by 2, and floor. This will be the byte in the
   * array where our value is. If the original offset was even, then the value
   * we want is in the upper nibble, otherwise the value is in the lower nibble.
   *
   * @param {number} x
   *   The blocks x position
   * @param {number} y
   *   The blocks y position
   *
   * @return {array}
   *   In the form [offset, upperBits] where offset is the index in the byte
   *   array and upperBits is a bool indcating whether the value is stored in
   *   either the upper nibble or lower nibble.
   */
  getOffsetFromPosition(x, y) {
    const wideOffset = x + (this.numCols * y);
    const upperBits = (wideOffset % 2 === 0);
    const offset = Math.floor(wideOffset / 2);
    return [offset, upperBits]
  }

  /**
   * Generator that emits all points from the bitmap
   *
   * @return {array}
   *   Coordinate and color data in the form [x, y, color]
   */
  *getAllPoints(x, y) {
    for (let x = 0; x < this.numCols; x++) {
      for (let y = 0; y < this.numCols; y++) {
        const wideOffset = x + (this.numCols * y);
        const upperBits = (wideOffset % 2 === 0);
        const offset = Math.floor(wideOffset / 2);
        const wideVal = bitmap[offset];
        const color = upperBits
          ? (wideVal & 0xF0) >> 4
          : (wideVal & 0x0F);
        yield [x, y, color];
      }
    }
  }
}

module.exports = LocalTable;
