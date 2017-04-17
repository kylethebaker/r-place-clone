import PlaceClone from "./PlaceClone";

const pixelsPerBlock = 8;
const socketUri = ":8080";

const app = new PlaceClone(pixelsPerBlock, socketUri);

window.PlaceClone = app;
