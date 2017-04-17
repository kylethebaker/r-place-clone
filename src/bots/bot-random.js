/**
 * Randomly places a block every few seconds
 */
const socket = require("socket.io-client").connect("http://localhost:8080");
const math = require("mathjs");

var [interval, ..._] = process.argv.slice(2);

if (!interval || isNaN(interval)) {
  console.log("Invalid interval. Usage is `nodesjs bot-random.js <interval-ms>`");
  process.exit();
}

var interval = parseInt(interval);
const intervalSeconds = interval / 1000;
var blockCount = 0;

console.log(`Sending random block every ${intervalSeconds} seconds.`);

setInterval(() => {
  if (blockCount > 0 && blockCount % 10 === 0) {
    console.log(`Sent ${blockCount} blocks`);
  }
  const x = math.randomInt(0, 100);
  const y = math.randomInt(0, 100);
  const color = math.randomInt(0, 16);
  socket.emit("placement", [x, y, color]);
  blockCount++;
}, interval);

process.on('SIGINT', function() {
  console.log(`Sent ${blockCount} blocks`);
  process.exit();
});
