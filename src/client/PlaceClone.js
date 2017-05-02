import SocketEventCache from "./SocketEventCache.js";
import ColorPalette from "./ColorPalette";
import ColorPicker from "./ColorPicker";
import CanvasWrapper from "./CanvasWrapper";
import LocalTable from "../shared/LocalTable.js";
import MetaBar from "./MetaBar";

/**
 * Bootstraps and runs the PlaceClone
 */
export default class PlaceClone {

  /**
   * Starts the Place Clone
   *
   * @param {array} colors
   *   Array of 16 hex color values
   * @param {number} pixelsPerBlock
   *   How many pixels wide/tall each block should be
   * @param {string} socketUri
   *   Websocket host uri
   */
  constructor(pixelsPerBlock, socketUri) {
    const canvasElement = document.getElementById("canvas");
    const colorPaletteElement = document.getElementById("palettes");
    const colorPickerElement = document.getElementById("colors");
    const metaBarElement = document.getElementById("metaBar");

    this.socket = io(socketUri);
    const colorPalette = new ColorPalette(colorPaletteElement);
    this.colorPicker = new ColorPicker(colorPickerElement, colorPalette);
    this.canvasWrapper = new CanvasWrapper(canvasElement, pixelsPerBlock);
    this.metaBar = new MetaBar(metaBarElement);
    this.localTable = new LocalTable();

    // capture any metadata events
    this.listenForIncomingMetadata();

    // capture any new user connections
    this.listenForNewUsers();

    // cache any incoming blocks between now and when the canvas is finished
    // downloading/rendering so that we don't miss any placements
    const tmpIncomingCache = new SocketEventCache("incoming", this.socket);
    tmpIncomingCache.startListening();

    // fetch and render the current canvas state from the server
    // then: populate the canvas using the bitmap data
    // then: place any cached blocks and stop caching,
    //       start collecting new incoming blocks,
    //       start transmitting new placement
    fetch("/bitmap").then((res) => {
      if (res.ok) {
        return res.arrayBuffer();
      }
      throw Error("fetching bitmap failed");
    }).then((buffer) => {
      const bitmap = new Uint8Array(buffer);
      this.localTable.loadFromBitmap(bitmap);
      return this.canvasWrapper.loadFromBitmap(bitmap, this.colorPicker.colors);
    }).then(() => {

      // black border == "loaded"
      this.canvasWrapper.canvas.style.border = "2px solid black";

      // start processing incoming blocks from the websocket
      this.listenForIncomingBlocks();

      // now that we have a downloaded and rendered the canvas, place any
      // cached blocks that we've received between the initial request and now
      tmpIncomingCache.stopListening();
      tmpIncomingCache.consumeCache().forEach((cachedEvent) => {
        if (cachedEvent.ok) {
          const [bx, by, colorIndex] = cachedEvent.data;
          const hexColor = this.colorPicker.getRgb(colorIndex);
          this.localTable.setBlock(bx, by, colorIndex);
          this.canvasWrapper.fillBlock(bx, by, hexColor);
        }
      });

      // start tracking canvas hovers to draw the current position indicator
      this.canvasWrapper.registerHoverListener(this.colorPicker);

      // start handling any new clicks / block placements
      this.registerCanvasClickListener();

      // register a callback to run when the current color is changed
      this.colorPicker.registerColorChangeHandler((color) => {
        // when current color is white, show the crosshair cursor so it doesn't
        // get lost on the background
        if (this.colorPicker.getCurrentIndex() === 15) {
          this.canvasWrapper.hoverCanvas.style.cursor = "crosshair";
        } else {
          this.canvasWrapper.hoverCanvas.style.cursor = "none";
        }
      })

      // add callbacks for zoom buttons
      this.registerZoomButtonListeners();

      // register a callback to redraw the canvas when a new palette is selected
      this.colorPicker.palette.registerPaletteChangeHandler((palette) => {
        const localBitmap = this.localTable.getBitmap();
        this.canvasWrapper.loadFromBitmap(localBitmap, palette.colors)
        .then(() => {
          this.colorPicker.refreshColors();
          console.log(`Loaded new palette (${palette.name}).`);
        }).catch(() => {
          console.error(`Failed loading new palette (${palette.name}).`);
        });
      });

    });
  }

  /**
   * Creates the onclick event handler for the canvas
   *
   * Anytime the canvas is clicked: find the encompassing block, fill it, and
   * broadcast to server
   */
  registerCanvasClickListener() {
    this.canvasWrapper.hoverCanvas.onclick = (event) => {
      const [bx, by] = this.canvasWrapper.getBlockUnderMouse(event);
      const colorRgb = this.colorPicker.getCurrentRgb();
      const colorIndex = this.colorPicker.getCurrentIndex();
      this.localTable.setBlock(bx, by, colorIndex);
      this.canvasWrapper.fillBlock(bx, by, colorRgb);
      this.sendBlockPlacement(bx, by, colorIndex);
    }
  }

  /**
   * Sends new block placement to server
   *
   * @param {number} x
   *   Block's x coordinate
   * @param {number} y
   *   Block's x coordinate
   * @param {number} color
   *   Color index
   */
  sendBlockPlacement(x, y, color) {
    console.log("sending: ", x, y, color);
    this.socket.emit("placement", [x, y, color]);
    this.metaBar.incrementSelfPlaced();
  }

  /**
   * Listens for placement errors
   */
  listenForPlacementErrors() {
    this.socket.on("placement:error", (err) => {
      console.error("Error placing block:", err.error, err.details);
    });
  }

  /**
   * Listens for incoming blocks and places them on the canvas
   */
  listenForIncomingBlocks() {
    this.socket.on("incoming", (incoming) => {
      if (incoming.ok) {
        const [x, y, color] = incoming.data;
        console.log("got: ", x, y, color);
        this.localTable.setBlock(x, y, color);
        this.canvasWrapper.fillBlock(x, y, this.colorPicker.getRgb(color));
        this.metaBar.incrementOthersPlaced();
      }
    });
  }

  /**
   * Listens for metadata event from the server
   */
  listenForIncomingMetadata() {
    this.socket.on("metadata", (info) => {
      console.log("got metadata", info);
      if (info.ok) {
        this.metaBar.setUserCount(info.data.connected_users);
      }
    });
  }

  /**
   * Listens for newuser event from the server
   */
  listenForNewUsers() {
    this.socket.on("newuser", (users) => {
      console.log("got newuser", users);
      if (users.ok) {
        this.metaBar.setUserCount(users.data);
      }
    });
  }

  /**
   * Zoom the canvas when the buttons are clicked
   */
  registerZoomButtonListeners() {
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");
    const resize = (event) => {
      let blockSize = this.canvasWrapper.blockSize;
      const bitmap = this.localTable.getBitmap();
      const colors = this.colorPicker.getColors();
      const directionBtn = event.target;
      if (directionBtn.id === "zoomIn") {
        blockSize = (blockSize + 2 >= 25) ? 25 : blockSize + 2;
      } else {
        blockSize = (blockSize - 2 <= 1) ? 1 : blockSize - 2
      }
      zoomIn.disabled = (blockSize >= 25)
      zoomOut.disabled = (blockSize <= 1)
      this.canvasWrapper.rescaleCanvas(bitmap, colors, blockSize)
      .then(() => {
        console.log("after", blockSize);
        console.log(`Rescaled to a blocksize of ${blockSize}`);
      });
    };
    zoomIn.onclick = resize;
    zoomOut.onclick = resize;
  }
}
