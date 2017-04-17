const fs = require("fs");

class ColorTable {

  /**
   * Constructs a new ColorTable
   *
   * If a table exists with the filename then load it, otherwise create a new
   * table.
   *
   * @param {string} filename
   *   Path to peristed table or new table path
   */
  constructor(filename, numCols=100) {
    this.filename = filename;
    this.unsaved = false;
    this.numCols = numCols;
    if (!fs.existsSync(filename)) {
      fs.closeSync(fs.openSync(filename, "w"));
      let bytesNeeded = (numCols * numCols) / 2;
      this.data = new Buffer.alloc(bytesNeeded, 255);
      this.unsaved = true;
      this.persistData();
    } else {
      this.data = fs.readFileSync(filename);
    }
  }

  /**
   * Persists the table to disk
   *
   * Data is only saved to disk if the table has unsaved changes
   *
   * @return {bool}
   *   Whether or not data was saved
   */
  persistData() {
    if (this.unsaved) {
      console.log("Saving table...");
      fs.writeFileSync(this.filename, this.data);
      this.unsaved = false;
      return true;
    }

    return false;
  }

  /**
   * Sets the color for a block
   *
   * @param {number} x
   *   The blocks x position
   * @param {number} y
   *   The blocks y position
   */
  setColor(x, y, color) {
    const [offset, upperBits] = this.getOffsetFromPosition(x, y);
    const existingWide = this.data[offset];
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

    this.data[offset] = newWide;
    this.unsaved = true;
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
  getColor(x, y) {
    const [offset, upperBits] = getOffsetFromPosition(x, y);
    const wide = this.data[offset];

    const upperMask = 0xF0;
    const lowerMask = 0x0F;

    return upperBits
      ? (wide & lowerMask)
      : (wide & upperMask) >> 4
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
    var s = upperBits ? "upper" : "lower";
    console.log(`${x},${y} is offset ${offset}, ${s}`);
    return [offset, upperBits]
  }
}

module.exports = ColorTable;
