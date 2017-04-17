/**
 * Name printing bot
 */
const math = require("mathjs");
const BotHelper = require("./baseBot");
const socket = require("socket.io-client").connect("http://localhost:8080");

const kyle = [
  ["X", " ", " ", "X", " ", "X", " ", " ", " ", "X", " ", "X", " ", " ", " ", "X", "X", "X"],
  ["X", " ", "X", " ", " ", " ", "X", " ", "x", " ", " ", "X", " ", " ", " ", "X", " ", " "],
  ["X", "X", " ", " ", " ", " ", " ", "X", " ", " ", " ", "X", " ", " ", " ", "X", "X", " "],
  ["X", " ", "X", " ", " ", " ", " ", "X", " ", " ", " ", "X", " ", " ", " ", "X", " ", " "],
  ["X", " ", " ", "X", " ", " ", " ", "X", " ", " ", " ", "X", "X", "X", " ", "X", "X", "X"],
];

botHelper = new BotHelper();
botHelper.protect([[0, 0], [1, 0], [2, 0]], 3);
console.log(botHelper

var letters = [];
var white = [];

for (let y = 0; y < kyle.length; y++) {
  for (let x = 0; x < kyle[i].length; x++) {
    if (kyle[y][x] === "X") {
      points.push([x, y]);
    }
  }
}

