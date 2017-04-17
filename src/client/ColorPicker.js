/**
 * Adds color picker component
 */
export default class ColorPicker {

  /**
   * Creates a new ColorPicker
   *
   * @param {HTMLElement} domElement
   *   The dom element to render the color picker in
   * @param {ColorPalette} colorPalette
   *   An instantiated ColorPalette to use
   */
  constructor(domElement, colorPalette) {
    this.element = domElement;

    this.palette = colorPalette;
    this.colors = this.palette.getColors();

    this.render();
    this.setCurrentColor(0);
    this.registerColorClickHandlers();
    this.registerHotkeys();
    this.registerScrollwheel();
  }

  /**
   * Renders the ColorPicker
   */
  render() {
    const list = document.createElement("ul");
    this.colors.forEach((color, index) => {
      const li = document.createElement("li");
      const contents = this.createColorItem(index, color);
      li.appendChild(contents);
      list.appendChild(li);
    });
    this.element.appendChild(list);
  }

  /**
   * Creates a <div> element for a color
   *
   * @param {string} name
   *   The colors name
   * @param {string} color
   *   The css color value
   *
   * @return {HTMLDivElement}
   */
  createColorItem(index, color) {
    const e = document.createElement("div");
    e.setAttribute("data-color-index", index);
    e.innerHTML = name;
    e.className = "color";
    e.style.backgroundColor = color;
    return e;
  }

  /**
   * Refreshes the color picker colors from the palette, used after changing
   * the palette.
   */
  refreshColors() {
    this.colors = this.palette.getColors();
    const elements = document.querySelectorAll(".color");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.backgroundColor = this.colors[i];
    }
  }

  /**
   * Registers a click handler to set the currently selected color on each of
   * the color items
   */
  registerColorClickHandlers() {
    const colors = document.querySelectorAll(".color");
    for (let i = 0; i < colors.length; i++) {
      colors[i].onclick = (event) => {
        let colorIndex = event.target.getAttribute("data-color-index");
        this.setCurrentColor(parseInt(colorIndex));
      };
    }
  }

  /**
   * Sets the current color and updates visual indicator
   */
  setCurrentColor(index) {
    this.selectedColor = index;
    const current = document.querySelector(".color[current-selection]");
    if (current !== null) {
      current.removeAttribute("current-selection");
    }
    const newSel = document.querySelector(`.color[data-color-index="${index}"]`);
    newSel.setAttribute("current-selection", "");
    // if a color change callback has been registered, then run it now
    if (this.colorChangeCallback) {
      this.colorChangeCallback(this.selectedColor);
    }
  }

  /**
   * Returns the colors from the current color palette
   *
   * @return {array}
   *   Array of colors in hex
   */
  getColors() {
    return this.palette.getColors();
  }

  /**
   * Returns the currently selected color index
   *
   * @return {number}
   */
  getCurrentIndex() {
    return this.selectedColor;
  }

  /**
   * Returns the RGB value of the current color
   *
   * @return {string}
   */
  getCurrentRgb() {
    return this.colors[this.selectedColor];
  }

  /**
   * Returns the RGB value of the provided color index
   *
   * @param {number} index
   *
   * @return {string}
   */
  getRgb(index) {
    return this.colors[index];
  }

  /**
   * Sets up hotkeys
   */
  registerHotkeys() {
    const leftArrow = 37;
    const rightArrow = 39;
    const keyA = 65;
    const keyD = 68;
    const keyW = 87;
    const keyS = 83;
    document.onkeydown = (e) => {
      switch (e.keyCode) {
        case leftArrow:
        case keyA:
          this.selectPrevColor();
          break;
        case rightArrow:
        case keyD:
          this.selectNextColor();
          break;
        case keyW:
          window.scrollBy(0, -20);
          break;
        case keyS:
          window.scrollBy(0, 20);
          break;
      }
    };
  }

  /**
   * Changes to the next color, cycling back to the first element if necessary
   */
  selectNextColor() {
    this.setCurrentColor((this.selectedColor + 1) % this.colors.length);
  }

  /**
   * Changes the prev color, cycling back to the last element if necessary
   */
  selectPrevColor() {
    this.setCurrentColor(
      this.selectedColor - 1 < 0
        ? this.colors.length - 1
        : this.selectedColor - 1
    );
  }

  /**
   * Capture scrollwheel scrolling for cycling through colors
   */
  registerScrollwheel() {
    this.element.addEventListener("wheel", (event) => {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.selectPrevColor();
      } else {
        this.selectNextColor();
      }
    });
  }

  /**
   * Registers a callback to run when the color is changed
   *
   * @param {function} fn
   *   Function that takes a color index and returns void
   */
  registerColorChangeHandler(fn) {
    this.colorChangeCallback = fn;
  }
}
