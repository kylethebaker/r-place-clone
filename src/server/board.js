const log = require("winston");

/**
 * Provides methods for setting and collecting board data
 */
class Board {

  /**
   * Creates a new Board
   */
  constructor(boardKey, redisClient) {
    this.boardKey = boardKey;
    this.redis = redisClient;
    this.numCols = null;
  }

  /**
   * Initializes board state
   *
   * We want to ensure that the board exists and also calculate and store the
   * number of rows/columns
   *
   * @return {Promise}
   */
  init() {
    return this.doesBoardExist()
      .then(() => this.getColumnCount(), this.initError);
  }

  /**
   * Rejection wrapper for board init
   *
   * @param {string} err
   *   The rejection reason
   *
   * @return {Promise}
   */
  initError(err) {
    return Promise.reject(err);
  }

  /**
   * Sets the color for a single block
   *
   * @param {number} x
   *   Block's x coordinate
   * @param {number} y
   *   Block's y coordinate
   * @param {number} color
   *   4bit color index
   *
   * @return {Promise}
   */
  setBlock(x, y, color) {
    if ([x, y, color].filter(Number.isInteger).length !== 3) {
      return Promise.reject("Invalid parameters");
    }
    return new Promise((ok, error) => {
      const offset = this.getBitOffset(x, y);
      const args = [this.boardKey, "set", "u4", "#"+offset, color];
      this.redis.bitfield(args, (err, res) => {
        if (err) {
          log.error("Couldn't set block", {x: x, y: y, offset: offset, color: color});
          error(err)
        } else {
          log.debug("Set block", {x: x, y: y, offset: offset, color: color});
          ok(res);
        }
      });
    });
  }

  /**
   * Fetches a single block's color
   *
   * @param {number} x
   *   Block's x coordinate
   * @param {number} y
   *   Block's y coordinate
   *
   * @return {Promise}
   */
  getBlock(x, y) {
    return new Promise((ok, error) => {
      const args = [this.boardKey, "get", "u4", this.getBitOffset(x, y)]
      this.redis.bitfield(args, (err, res) => {
        if (err) {
          log.error("Couldn't get block", {x: x, y: y, color: color});
          error(err)
        } else {
          log.debug("Getting block", {x: x, y: y, color: color});
          ok(res);
        }
      });
    });
  }

  /**
   * Fetches then entire board
   *
   * @return {Promise}
   */
  getBoard() {
    return new Promise((ok, error) => {
      this.redis.get(this.boardKey, (err, res) => {
        if (err !== null) {
          log.error("Couldn't fetch board", {key: this.boardKey});
          error(err);
        } else {
          log.debug("Got board", {key: this.boardKey});
          ok(res);
        }
      });
    });
  }

  /**
   * Checks if a block is valid
   *
   * Valid blocks should have 3 integers. X and Y should be between 0 and the
   * column size, and colors should be valid 4 bit values.
   *
   * @param {number} x
   *   Block's x coordinate
   * @param {number} y
   *   Block's y coordinate
   * @param {number} color
   *   Blocks 4bit color
   *
   * @return {bool}
   *   True for valid block, false otherwise
   */
  isValidBlock(x, y, color) {
    return (([x, y, color].filter(Number.isInteger).length === 3)
            && (color >= 0 && color < 16)
            && (x >= 0 && x < this.numCols)
            && (y >= 0 && y < this.numCols));
  }

  /**
   * Given a block (x, y) coordinate, returns the bit offset
   *
   * @param {number} x
   *   Block x coordinate
   * @param {number} y
   *   Block y coordinate
   *
   * @return {number}
   *   The number of rows and columns
   */
  getBitOffset(x, y) {
    return x + (this.numCols * y);
  }

  /**
   * Checks that the board exists
   *
   * @return {Promise}
   */
  doesBoardExist() {
    return new Promise((exists, doesntExist) => {
      this.redis.exists(this.boardKey, (err, res) => {
        if (err || !res) {
          log.error("Board doesn't exist", {key: this.boardKey});
          doesntExists("Board doesn't exist");
        }
        log.debug("Found board", {key: this.boardKey});
        exists();
      });
    });
  }

  /**
   * Fetches and sets the number of rows / columns on the board
   *
   * Each byte holds two blocks, and boards are always square.
   *
   * @return {Promise}
   */
  getColumnCount() {
    return new Promise((ok, error) => {
      this.redis.strlen(this.boardKey, (err, res) => {
        if (err) {
          error(err);
        } else {
          this.numCols = Math.sqrt(res * 2);
          ok();
        }
      });
    });
  }
}

module.exports = Board;
