/**
 * Displays, sets, and retrieves different color palettes
 */
export default class ColorPalette {

  /**
   * Creates a new ColorPalette
   *
   * @param {HTMlElement} domElement
   *   The dom element to render the palette switcher in
   */
  constructor(domElement) {
    this.element = domElement;

    this.palettes = PALETTES;
    this.current = null;

    this.render();
    this.setPalette(0);
    this.registerPaletteClickHandlers();
  }

  /**
   * Renders the color palette in the dom
   */
  render() {
    const list = document.createElement("ul");

    this.palettes.forEach((palette, index) => {
      const li = document.createElement("li");
      const container = document.createElement("div");

      container.innerHTML = `<div class='palette--name'>${palette.name}</span>`;
      container.className = "palette";
      container.appendChild(this.createPalettePreview(palette.colors))
      container.setAttribute("data-palette-index", index);
      container.setAttribute("data-palette-name", palette.name);

      li.appendChild(container);
      list.appendChild(li);
    });

    //this.element.style.display = "none";
    this.element.appendChild(list);
  }

  /**
   * Creates a pretty rainbow style preview of the palette
   *
   * @param {array} colors
   *   The palette colors
   *
   * @return {HTMLDivElement}
   */
  createPalettePreview(colors) {
    const container = document.createElement("div");
    container.className = "palette--preview";
    colors.forEach((color, index) => {
      const span = document.createElement("span");
      span.innerHTML = index;
      span.className = "palette--color";
      span.style.backgroundColor = color;
      container.appendChild(span);
    });
    return container;
  }

  /**
   * Registers click handler for each of the palettes and the palette display
   */
  registerPaletteClickHandlers() {
    for (let palette of document.querySelectorAll(".palette")) {
      palette.onclick = (event) => {
        const closest = event.target.closest(".palette");
        const index = closest.getAttribute("data-palette-index");
        this.setPalette(parseInt(index));
      }
    }
    document.getElementById("paletteButton").onclick = (event) => {
      if (this.element.classList.contains("opened")) {
        this.close();
      } else {
        this.open();
      }
    };
    document.getElementById("overlay").onclick = (event) => {
        this.close();
    };
  }

  /**
   * Opens the palette selector
   */
  open() {
    if (!this.element.classList.contains("opened")) {
      document.getElementById("overlay").style.visibility = "visible";
      this.element.classList.remove("slide-out");
      this.element.classList.add("slide-in");
      this.element.classList.add("opened");
    }
  }

  /**
   * Closes the palette selector
   */
  close() {
    if (this.element.classList.contains("opened")) {
      document.getElementById("overlay").style.visibility = "hidden";
      this.element.classList.remove("opened");
      this.element.classList.remove("slide-in");
      this.element.classList.add("slide-out");
    }
  }

  /**
   * Returns the currently select palette's color array
   *
   * @return {String[]}
   *   Array of hex colors
   */
  getColors() {
    return this.palettes[this.current].colors;
  }

  /**
   * Changes the current palette
   *
   * @param {number} index
   *   The palette index to switch to
   */
  setPalette(index) {
    // avoid needlessly redrawing the canvas if we don't need to
    if (index === this.current) return;

    this.current = index;

    const currentEl = document.querySelector(".palette[current-selection]");
    const newEl = document.querySelector(`.palette[data-palette-index="${index}"]`);

    if (currentEl !== null) {
      currentEl.removeAttribute("current-selection");
    }
    newEl.setAttribute("current-selection", "");

    if (this.paletteChangeCallback) {
      this.paletteChangeCallback(this.palettes[this.current]);
    }

  }

  /**
   * Returns the palette object at some index
   *
   * @param {number} index
   *   The palette index to get
   *
   * @return {object}
   *   The palette object with 'name' and 'colors' key
   */
  getPalette(index) {
    return this.palettes[index];
  }


  /**
   * Registers a callback to run when the palette is changed
   *
   * @param {function}
   *   The callback to run
   */
  registerPaletteChangeHandler(callback) {
    this.paletteChangeCallback = callback;
  }
}

const PALETTES = [
  {
    name: "Default",
    colors: [
      "#000000", // black
      "#373b41", // gray-D
      "#676b71", // gray-L
      "#912e2e", // red-D
      "#cc6666", // red-L
      "#78802c", // green-L
      "#b5bd68", // green-D
      "#de935f", // yellow-L
      "#f0c674", // yellow-D
      "#4b6d89", // blue-L
      "#81a2be", // blue-D
      "#71537b", // magenta-L
      "#b294bb", // magenta-D
      "#4a7973", // cyan-L
      "#8abeb7", // cyan-D
      "#ffffff", // white,
    ],
  },
  {
    name: "Meh",
    colors: [
      "#000000", // black
      "#262626", // gray-D
      "#6f6f6f", // gray-L
      "#db2d20", // red-D
      "#ed7369", // red-L
      "#01a252", // green-D
      "#5ecd96", // green-L
      "#ffef00", // yellow-D
      "#fbf488", // yellow-L
      "#01a0e4", // blue-D
      "#6fcaf1", // blue-L
      "#a16a94", // magenta-D
      "#a18f9d", // magenta-L
      "#008a8c", // cyan-D
      "#15e1e4", // cyan-L
      "#ffffff", // white,
    ],
  },
  {
    name: "Navy and Ivory",
    colors: [
      "#021b21", // black
      "#032c36", // gray-D
      "#065f73", // gray-L
      "#c2454e", // red-D
      "#ef5847", // red-L
      "#7cbf9e", // green-D
      "#b3e8c1", // green-L
      "#8a7a63", // yellow-D
      "#beb090", // yellow-L
      "#2e3340", // blue-D
      "#61778d", // blue-L
      "#ff5879", // magenta-D
      "#ff99a1", // magenta-L
      "#44b5b1", // cyan-D
      "#9ed9d8", // cyan-L
      "#e8dfd6", // white,
    ],
  },
  {
    name: "Vacuous",
    colors: [
      "#101010", // black
      "#202020", // gray-D
      "#606060", // gray-L
      "#b91e2e", // red-D
      "#e94f52", // red-L
      "#81957c", // green-D
      "#add18f", // green-L
      "#f7a04c", // yellow-D
      "#f6d574", // yellow-L
      "#356579", // blue-D
      "#7491a1", // blue-L
      "#2d2031", // magenta-D
      "#87314e", // magenta-L
      "#0b3452", // cyan-D
      "#0f829d", // cyan-L
      "#eeeeee", // white,
    ],
  },
  {
    name: "3024",
    colors: [
      "#000000", // black
      "#262626", // gray-D
      "#6f6f6f", // gray-L
      "#db2d20", // red-D
      "#ed7369", // red-L
      "#01a252", // green-D
      "#5ecd96", // green-L
      "#ffef00", // yellow-D
      "#fbf488", // yellow-L
      "#01a0e4", // blue-D
      "#6fcaf1", // blue-L
      "#a16a94", // magenta-D
      "#a18f9d", // magenta-L
      "#008a8c", // cyan-D
      "#55e1e3", // cyan-L
      "#ffffff", // white,
    ],
  },
  {
    name: "Grayscale",
    colors: [
      "#000000", // black
      "#111111", // gray-D
      "#222222", // gray-L
      "#333333", // red-D
      "#444444", // red-L
      "#555555", // green-D
      "#666666", // green-L
      "#777777", // yellow-D
      "#888888", // yellow-L
      "#999999", // blue-D
      "#aaaaaa", // blue-L
      "#bbbbbb", // magenta-D
      "#cccccc", // magenta-L
      "#dddddd", // cyan-D
      "#eeeeee", // cyan-L
      "#ffffff", // white,
    ],
  },
  {
    name: "Yousai",
    colors: [
      "#34302d",
      "#666661",
      "#7f7f7a",
      "#992e2e",
      "#db4242",
      "#4c3226",
      "#ab6e54",
      "#a67c53",
      "#e8ae75",
      "#4c7399",
      "#76b0e9",
      "#bf9986",
      "#f3b290",
      "#d97742",
      "#ff8b3d",
      "#f5e7de",
    ],
  },
  {
    name: "VisiBlue",
    colors: [
      "#666699",
      "#333366",
      "#333399",
      "#6666cc",
      "#9999ff",
      "#0099cc",
      "#00ccff",
      "#3366cc",
      "#6699ff",
      "#006699",
      "#0099cc",
      "#0066ff",
      "#0099ff",
      "#669999",
      "#66cccc",
      "#000000",
    ],
  },
];
